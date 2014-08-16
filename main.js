'use strict';

var requirejs = require('requirejs');

// RequireJS config
requirejs.config({
    nodeRequire: require,
    paths: {
        // Load Texty and connection modules
        Texty: 'texty/texty',
        TCPConnection: 'texty/lib/connections/tcp',
        OrchestrateStore: 'texty/lib/auth/redis',

        // Load the object action files (And the world and templates, but need to figure out a way to make it work)
        CampfireActions: 'stroll/campfire'
    }
});

requirejs(['Texty', 'TCPConnection', 'OrchestrateStore', 'fs', 'CampfireActions'],
function (Texty, TCPConnection, OrchestrateStore, fs, campfireActions) {

    // Load the game module and template (This should come in via RequireJS)
    var world = JSON.parse(fs.readFileSync(__dirname + '/stroll/world.json')),
        template = JSON.parse(fs.readFileSync(__dirname + '/texty/templates/ansiTelnet.json'));

    // Initialize the Texty module with the game
    var game = new Texty({
        world: world,
        actions: {
            'campfire': campfireActions,
            'stick': null
        }
    });

    // Initialize the TCP connection
    var tcp = new TCPConnection(game, {
        port: process.env.PORT || 10070
    });

    // Initialize the connection to Orchestrate
    var db = new OrchestrateStore({
        token: 'f57a7ecb-b0a6-4ae6-913f-84b9b1c25905'
    });

    // Add listeners
    tcp.on('connect', function (session, callback) {
        callback('Please enter your username:\r\n');
        return;
    });

    // Session store
    var sessionsByUser = {},
        sessionsById = {};

    tcp.on('command', function (session, command, callback) {
        
        session.auth = session.auth || {};

        // Authentication logic
        if (!session.auth.authenticated) {
            if (!session.auth.username || session.auth.username == '') {

                // Check if the entered username was blank
                if (command != '') {
                    session.auth.username = command;
                    callback('\r\nPlease enter your password:\r\n');
                } else {
                    callback('Invalid username. Please enter your username:\r\n');
                }

            } else if (!session.auth.authenticated) {

                // Authenticate against the db (I should really check for success/failure)
                db.auth(session.auth.username, command, function (err, res) {

                    if (!err && res) {

                        session.auth.authenticated = true;
                        session.auth.userId = res;

                        // Now that we're authenticated, attempt to load the game state from Redis
                        db.load(session.auth.userId, function (err, res) {

                            if (!err) {
                                // Convert the loaded user state object into a compatible game state
                                session.gameState = game.initializeState(session.auth.userId, res, template);
                                callback(game.displayWelcome(session.gameState));
                            } else {
                                // Create a new user game state object
                                session.gameState = game.createNewState(session.auth.userId, template);
                                callback(game.displayWelcome(session.gameState));
                            }

                        });

                    } else {

                        // Username and password not found
                        delete session.auth.username;
                        callback('\r\nAuthentication failed. Please enter your username:\r\n');

                    }

                });
            }

        } else {

            if (!session.auth.started) {
                // Begin the game and show the players last state
                session.auth.started = true;
                game.start(session.gameState, function (data) {
                    sessionsByUser[session.auth.username] = session;
                    sessionsById[session.sessionId] = session;
                    callback(data);
                });
                return;
            }

            // From now on, defer all commands to the command parser so that the game can take over
            // NOTE: Maybe unless the command starts with "texty" or something? Might need a bit of rearchitecting
            // NOTE 2: Actually, the parseCommand method shouldn't be responsible for the prefixing. We should check it outside, and only send it to Texty if it's supposed to go there.
            game.parseCommand(session.gameState, command, function (data) {
                callback(data);
                return;
            });
        }
    });


    // Handle a user disconnect
    tcp.on('disconnect', function (session) {
        // If this isn't set, they were never properly in the game
        if (sessionsById[session.sessionId]) {
            game.quit(sessionsById[session.sessionId].auth.username);
        }
    });


    // Handle game triggered events where a user needs notified
    game.on('gameEvent', function (gameState, data) {
        if (sessionsByUser[gameState.player]) {
            tcp.sendData(sessionsByUser[gameState.player].sessionId, data);
            return true;
        } else {
            return false;
        }
    });


    // Handle a user quitting the game
    game.on('quit', function (gameState) {
        // Force tcp disconnect
        if (gameState) {
            tcp.endConnection(sessionsByUser[gameState.player].sessionId);
            delete sessionsById[sessionsByUser[gameState.player].sessionId];
            delete sessionsByUser[gameState.player];
        }
    });

});
