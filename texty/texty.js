// Requires
var util = require('util'),
    events = require('events');

// Load config
var configSettings = JSON.parse(require('fs').readFileSync(__dirname + '/config.json'));

// Create the constructor
var Texty = function (config) {

    self = this;
    events.EventEmitter.call(self);

    var config = config || {};

    // Load modules
    self.modules = {
        utils: (require(__dirname + '/lib/utils.js'))()
    }

    var availableModules = ['commandParser', 'gameMessaging', 'gameController'];

    for (var module in availableModules) {
        self.modules[availableModules[module]] = config.modules[availableModules[module]] ? (config.modules[availableModules[module]](self.modules)) : (require(__dirname + '/lib/' + availableModules[module] + '.js'))(self.modules);
    }

    // Start the world
    self.worldTemplate = config.world;
    self.world = self.preprocessWorld(JSON.parse(JSON.stringify(self.worldTemplate)));

    // Create the player store
    self.players = {};

    if (config.auth) {
    	self.auth = config.auth;
    }

    console.log(self.world.title + ' loaded');
    console.log('Texty ' + configSettings.version + ' initialized');

}

// Assign to exports
util.inherits(Texty, events.EventEmitter);
module.exports = Texty;

// Convert a datastore object to a game object
Texty.prototype.initializeState = function (stateObj) {
    return stateObj;
}

// Create a new game object based on the starting prototype
Texty.prototype.createNewState = function (player) {
    // We do this to deliberately make sure that the clone of the starting player object does not contain any methods or logic
    // NOTE: Perhaps not the most performant way of doing this?!
    var gameState = JSON.parse(JSON.stringify(this.world.player));
    return gameState;
}

// Clears the screen and displays the welcome message
Texty.prototype.displayWelcome = function () {
    return this.modules.gameMessaging.displayWelcome(this.world);
}

// This is used for preprocessing the world object into something a little bit more performant, ie. turning arrays into hashes, etc.
Texty.prototype.preprocessWorld = function (world) {
    return world;
}


// Parse incoming commands
Texty.prototype.parseCommand = function (player, command, callback) {
    this.modules.commandParser.parseCommand(this.world, this.players[player], command, callback);
}

// Starts the game
Texty.prototype.start = function (player, initialState, callback) {
    this.players[player] = this.modules.gameController.switchRooms(this.world, initialState, initialState.position, callback);
}