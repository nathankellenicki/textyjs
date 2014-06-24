var asset = require('assert');

var Texty = require('../texty/texty.js');

// Load the game module
var world = JSON.parse(require('fs').readFileSync(__dirname + '/../test/world.json'));

// Initialize the Texty module with the game
var game = new Texty({
    world: world
});

console.log(game.displayWelcome());

var startState = game.createNewState();

game.start('user1', startState, function (data) {
    console.log(data);
});