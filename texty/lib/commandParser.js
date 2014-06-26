// Create the constructor
var CommandParser = function (textyObj, config) {

	var self = this;

	self.modules = config;
	self.textyObj = textyObj;
    console.log("CommandParser initialized");

}


// Command parser method
CommandParser.prototype.parseCommand = function (world, gameState, command, callback) {

	var commandParts = command.split(' '),
		commandList = this.assembleCommandList(world, gameState);

	// Check each iteration of the comman and see if it matches anything in the command list
	for (var i = commandParts.length; i > 0; i--) {

		var reconstructedCommand = '',
			reconstructedOptions = '';

		// Reconstruct a partial command with options
		reconstructedCommand = commandParts.slice(0, i).join(' ');
		reconstructedOptions = commandParts.slice(i, commandParts.length).join(' ');

		// Test it here
		if (commandList[reconstructedCommand]) {
			commandList[reconstructedCommand](world, gameState, reconstructedOptions, callback);
			return;
		}

	}

    callback('Command not recognised.\r\n\r\n');

}


// Assemble command list for the parse method
CommandParser.prototype.assembleCommandList = function (world, gameState) {

	var self = this,
		commandList = {},
		currentRoom = world.rooms[gameState.position];

	commandList['inventory'] = function (world, gameState, options, callback) {
		self.modules.gameController.displayInventory(world, gameState, callback);
	}

	commandList['items'] = function (world, gameState, options, callback) {
		self.modules.gameController.displayItems(world, gameState, gameState.position, callback);
	}

	commandList['directions'] = function (world, gameState, options, callback) {
		self.modules.gameController.displayDirections(world, gameState, gameState.position, callback);
	}

	// Add directions to command list
	for (var direction in currentRoom.exits) {
		commandList[direction] = function (world, gameState, options, callback) {
			self.modules.gameController.switchRooms(world, gameState, currentRoom.exits[direction].to, callback);
		}
	}

	// Add items from immediate area to command list
	commandList['look at'] = function (world, gameState, options, callback) {
		self.modules.gameController.lookAtItem(world, gameState, options, callback);
	}

	commandList['pick up'] = function (world, gameState, options, callback) {
		self.modules.gameController.pickUpItem(world, gameState, options, callback);
	}

	commandList['drop'] = function (world, gameState, options, callback) {
		self.modules.gameController.dropItem(world, gameState, options, callback);
	}

	// Multiplayer and party implementation stuff goes here (NOTE: Perhaps this should be turned on/off depending on whether Texty is used client or server side)
	// NOTE2: This should totally be in a multiplayerController.js file. Get it out of here.

	commandList['players'] = function (world, gameState, options, callback) {
		self.modules.socialController.displayLocalPlayers(world, gameState, callback);
	}

	commandList['message'] = function (world, gameState, options, callback) {
		if (options.split(' ').length >= 2) {
			self.modules.socialController.sendMessage(gameState, options.split(' ', 2)[0], options.split(' ', 2)[1], callback);
		} else {
			callback('Could not send message.\r\n\r\n');
		}
	}

	commandList['party invite'] = function (world, gameState, options, callback) {
		self.modules.socialController.inviteToParty(gameState, options, callback);
	}

	return commandList;

}


// Assign to exports
module.exports = function (textyObj, config) {
	return (new CommandParser(textyObj, config));
};