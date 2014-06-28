// Require available modules here, before anything else
define([
    'require',
    'texty/lib/utils',
    'texty/lib/commandParser',
    'texty/lib/gameMessaging',
    'texty/lib/gameController',
    'texty/lib/socialController',
    'texty/lib/socialMessaging'
],
function (require, utils, commandParser, gameMessaging, gameController, socialController, socialMessaging) {

    // Create the constructor
    var Texty = function (config) {

        self = this;

        var config = config || {};

        // Event handler warehouse
        self.eventHandlers = {}

        // Load modules
        self.modules = {
            utils: utils()
        }

        var availableModules = ['commandParser', 'gameMessaging', 'gameController', 'socialController', 'socialMessaging'];

        for (var module in availableModules) {
            self.modules[availableModules[module]] = (config.modules && config.modules[availableModules[module]]) ? (config.modules[availableModules[module]](self, self.modules)) : eval(availableModules[module] + '(self, self.modules)');
        }

        // Start the world
        self.worldTemplate = config.world;
        self.world = self.instantiateWorld();

        // Create the player store
        self.players = {};
        self.parties = [];

        if (config.auth) {
            self.auth = config.auth;
        }

        console.log(self.world.title + ' loaded');
        console.log('Texty engine initialized');

    }

    // Convert a datastore object to a game object
    Texty.prototype.initializeState = function (stateObj) {
        return stateObj;
    }

    // Create a new game object based on the starting prototype
    Texty.prototype.createNewState = function (player) {
        // We do this to deliberately make sure that the clone of the starting player object does not contain any methods or logic
        // NOTE: Perhaps not the most performant way of doing this?!
        var gameState = JSON.parse(JSON.stringify(this.world.player));
        gameState.player = player;
        return gameState;
    }

    // Clears the screen and displays the welcome message
    Texty.prototype.displayWelcome = function () {
        return this.modules.gameMessaging.displayWelcome(this.world);
    }

    // This is used for preprocessing the world object into something a little bit more performant, ie. turning arrays into hashes, etc.
    Texty.prototype.instantiateWorld = function () {
        return JSON.parse(JSON.stringify(this.worldTemplate))
    }


    // Parse incoming commands
    Texty.prototype.parseCommand = function (player, command, callback) {
        this.modules.commandParser.parseCommand(this.world, this.players[player], command, callback);
    }


    // Starts the game
    Texty.prototype.start = function (player, initialState, callback) {
        this.players[player] = this.modules.gameController.switchRooms(this.world, initialState, initialState.position, callback);
    }


    // External event handler registration
    Texty.prototype.on = function (event, callback) {
        this.eventHandlers[event] = callback;
    }


    // Internal event handler trigger
    Texty.prototype.triggerGameEvent = function (player, data) {
        if (this.eventHandlers['gameEvent']) {
            return this.eventHandlers['gameEvent'](player, data);
        }
        return true;
    }

    return Texty;

});