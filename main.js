var requirejs = require('requirejs');

// RequireJS config
requirejs.config({
    nodeRequire: require,
    paths: {
        Texty: 'texty/texty',
        TCPConnection: 'texty/lib/connections/tcp',
        RedisStore: 'texty/lib/auth/redis'
    }
});

requirejs(['Texty', 'TCPConnection', 'RedisStore', 'fs'],
function (Texty, TCPConnection, RedisStore, fs) {

    // Load the game module
    var world = JSON.parse(fs.readFileSync(__dirname + '/stroll/world.json'));

    // Initialize the Texty module with the game
    var game = new Texty({
        world: world
    });

    // Initialize the TCP connection
    var tcp = new TCPConnection(game, {
        port: 10070
    });

    // Initialize the connection to Redis
    var redis = new RedisStore({
        host: 'localhost',
        port: 6379
    });

    // Add listeners
    tcp.on('connection', function (session, callback) {
        callback('Please enter your username:\r\n');
        return;
    });

    // Session store
    var sessions = {};

    tcp.on('command', function (session, command, callback) {
        
        session.auth = session.auth || {};

        // Authentication logic
        if (!session.auth.authenticated) {
            if (!session.auth.username) {
                session.auth.username = command;
                callback('Please enter your password:\r\n');
            } else if (!session.auth.authenticated) {

                // Authenticate against Redis (I should really check for success/failure)
                redis.auth(session.auth.username, command, function (err, res) {

                    if (!err && res) {

                        session.auth.authenticated = true;
                        session.auth.userId = res;

                        sessions[session.auth.username] = session;

                        // Now that we're authenticated, attempt to load the game state from Redis
                        redis.load(session.auth.userId, function (err, res) {

                            if (!err) {
                                // Convert the loaded user state object into a compatible game state
                                session.gameState = game.initializeState(res);
                                console.log('Game state loaded for user id ' + session.auth.userId);
                                callback(game.displayWelcome());
                            } else {
                                // Create a new user game state object
                                session.gameState = game.createNewState(session.auth.userId);
                                console.log('Game state created from scratch for user id ' + session.auth.userId);
                                callback(game.displayWelcome());
                            }

                        });

                    } else {

                        // Username and password not found
                        delete session.auth.username;
                        console.log('User id not found');
                        callback('User not found, please try again.');

                    }

                });
            }

        } else {

            if (!session.auth.started) {
                // Begin the game and show the players last state
                session.auth.started = true;
                game.start(session.auth.username, session.gameState, function (data) {
                    callback(data);
                });
                return;
            }

            // From now on, defer all commands to the command parser so that the game can take over
            // NOTE: Maybe unless the command starts with "texty" or something? Might need a bit of rearchitecting
            // NOTE 2: Actually, the parseCommand method shouldn't be responsible for the prefixing. We should check it outside, and only send it to Texty if it's supposed to go there.
            game.parseCommand(session.auth.username, command, function (data) {
                callback(data);
                return;
            });
        }
    });

    game.on('gameEvent', function (player, data) {
        if (sessions[player]) {
            tcp.sendData(sessions[player].sessionId, data);
            return true;
        } else {
            return false;
        }
    });

});