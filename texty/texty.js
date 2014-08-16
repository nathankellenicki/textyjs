// Require available modules here, before anything else
define([
    'require',
    'texty/lib/utils',
    'texty/lib/commandParser',
    'texty/lib/controllers/game',
    'texty/lib/controllers/social',
],
function (require, utils, commandParser, gameController, socialController) {

    // Create the constructor
    var Texty = function (config) {

        self = this;

        var config = config || {};

        // Event handler warehouse
        self.eventHandlers = {}

        // Initialise controllers
        self.commandParser = commandParser(self);

        self.controllers = {
            game: gameController(self),
            social: socialController(self)
        };

        self.objectModules = config.actions;

        // Start the world
        self.worldTemplate = config.world;
        self.world = self.instantiateWorld();

        // Create the player store
        self.players = {};

        if (config.auth) {
            self.auth = config.auth;
        }

        console.log(self.world.title + ' loaded');
        console.log('Texty engine initialized');

    }

    
    // Define player state constants
    Texty.prototype.PlayerState = {
        'ROOM': 0,
        'PARTY_INVITE': 1,
        'NPC_CONVERSATION': 2
    }


    // Convert a datastore object to a game object
    Texty.prototype.initializeState = function (player, stateObj, template) {
        return {
            player: player,
            state: {
                type: this.PlayerState.ROOM
            },
            template: template,
            roomHistory: [],
            warehouse: stateObj
        };
    }

    // Create a new game object based on the starting prototype
    Texty.prototype.createNewState = function (player, template) {
        // We do this to deliberately make sure that the clone of the starting player object does not contain any methods or logic
        // NOTE: Perhaps not the most performant way of doing this?!
        return {
            player: player,
            state: {
                type: this.PlayerState.ROOM
            },
            template: template,
            roomHistory: [],
            warehouse: JSON.parse(JSON.stringify(this.world.player))
        };
    }

    // Clears the screen and displays the welcome message
    Texty.prototype.displayWelcome = function (gameState) {
        return this.controllers.game.welcome(this.world, gameState);
    }

    // This is used for preprocessing the world object into something a little bit more performant, ie. turning arrays into hashes, etc.
    Texty.prototype.instantiateWorld = function () {
        return JSON.parse(JSON.stringify(this.worldTemplate))
    }


    // Parse incoming commands
    Texty.prototype.parseCommand = function (gameState, command, callback) {
        this.commandParser.parseCommand(gameState, command, callback);
    }


    // Starts the game for a player
    Texty.prototype.start = function (initialState, callback) {
        this.players[initialState.player] = this.controllers.game.switchRooms(this.world, initialState, initialState.warehouse.position, callback);
    }

    // Quits the game for a player
    Texty.prototype.quit = function (player, callback) {

        var gameState = this.players[player];

        if (callback) {
            //this.controllers.game.goodbye(this.players[player], callback);
        }

        // Drop the party if the player is in one
        this.controllers.social.dropParty(gameState);

        // Trigger the event (NOTE: Could cause a circular loop?)
        this.triggerGameEvent('quit', gameState, null);

        delete this.players[player];

    }


    // External event handler registration
    Texty.prototype.on = function (event, callback) {
        this.eventHandlers[event] = callback;
    }


    // Internal event handler trigger
    Texty.prototype.triggerGameEvent = function (gameEvent, gameState, data) {
        if (this.eventHandlers[gameEvent]) {
            return this.eventHandlers[gameEvent](gameState, data);
        }
        return true;
    }

    return Texty;

});