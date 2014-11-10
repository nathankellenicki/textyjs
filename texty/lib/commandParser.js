define([
	'texty/lib/utils'
],
function (utils) {

	// Load modules
    var Utils = utils();

	// Create the constructor
	var CommandParser = function (textyObj) {

		var self = this;

		self.textyObj = textyObj;
	    console.log("CommandParser initialized");

	}


	// Command parser method
	CommandParser.prototype.parseCommand = function (gameState, command, callback) {

		console.log(gameState.player + ' - "' + command + '"');

		var commandParts = command.split(' '),
			world = ((this.textyObj.world.rooms[gameState.warehouse.position].instanced) ? gameState.world : this.textyObj.world),
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
			Texty = self.textyObj,
			commandList = {},
			currentRoom = world.rooms[gameState.warehouse.position];

		switch(gameState.state.type) {

			case Texty.PlayerState.PARTY_INVITE:

				commandList['yes'] = commandList['y'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.social.acceptPartyInvite(gameState, callback);
				}

				commandList['no'] = commandList['n'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.social.declinePartyInvite(gameState, callback);
				}

				break;

			case Texty.PlayerState.NPC_CONVERSATION:

				for (var option in gameState.state.conversationPoint.you) {

					var number = (parseInt(option, 10) + 1);

					(function (number) {
						commandList[number] = function (world, gameState, options, callback) {
							self.textyObj.controllers.game.conversationChoice(world, gameState, number, callback);
						}
					})(number);

				}

				break;

			default: // Texty.PlayerState.ROOM

				commandList['inventory'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.displayInventory(world, gameState, callback);
				}

				commandList['items'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.displayItems(world, gameState, gameState.warehouse.position, callback);
				}

				commandList['directions'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.displayDirections(world, gameState, gameState.warehouse.position, callback);
				}

				// Add directions to command list
				for (var direction in currentRoom.exits) {
					(function (direction) {
						commandList[direction] = function (world, gameState, options, callback) {
							self.textyObj.controllers.game.switchRooms(world, gameState, currentRoom.exits[direction].to, callback);
						}
					})(direction);
				}

				// Add items from immediate area to command list
				commandList['look at'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.lookAtItem(world, gameState, options, callback);
				}

				commandList['pick up'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.pickUpItem(world, gameState, options, callback);
				}

				commandList['drop'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.dropItem(world, gameState, options, callback);
				}

				commandList['quit'] = function (world, gameState, options, callback) {
					self.textyObj.quit(gameState.player, callback);
				}

				// Multiplayer and party implementation stuff goes here (NOTE: Perhaps this should be turned on/off depending on whether Texty is used client or server side)
				// NOTE2: This should totally be in a multiplayerController.js file. Get it out of here.

				commandList['players'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.social.displayLocalPlayers(world, gameState, callback);
				}

				commandList['message'] = function (world, gameState, options, callback) {
					if (options.split(' ').length >= 2) {
						self.textyObj.controllers.social.sendMessage(gameState, options.split(' ', 2)[0], options.slice(options.indexOf(' ') + 1), callback);
					} else {
						callback('Could not send message.\r\n\r\n');
					}
				}

				commandList['party invite'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.social.inviteToParty(gameState, options, callback);
				}

				commandList['party drop'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.social.dropParty(gameState, callback);
				}

				commandList['party message'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.social.sendPartyMessage(gameState, options, callback);
				}

				commandList['help'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.commandList(gameState, commandList, callback);
				}

				// Add object actions from the immediate area to the command list
				for (var object in currentRoom.objects) {
					if (currentRoom.objects[object] >= 1 && world.objects[object].commands && Utils.numProperties(world.objects[object].commands) >= 1) {
						for (var action in world.objects[object].commands) {

							var actionObj = world.objects[object].commands[action];

							if ((actionObj.holding != 'undefined' && !actionObj.holding) || !actionObj.holding) {
								(function (action, actionObj, object) {
									commandList[action + ' ' + object] = function (world, gameState, options, callback) {
										self.textyObj.objectModules[actionObj.module][actionObj.method](self.textyObj.controllers.interface(world, gameState), options, callback);
									}
								})(action, actionObj, object);
							}

						}
					}
				}

				// Add object actions from your inventory to the command list
				for (var object in gameState.warehouse.inventory) {
					if (gameState.warehouse.inventory[object] >= 1 && world.objects[object].commands && Utils.numProperties(world.objects[object].commands) >= 1) {
						for (var action in world.objects[object].commands) {

							var actionObj = world.objects[object].commands[action];

							if ((actionObj.dropped != 'undefined' && !actionObj.dropped) || !actionObj.dropped) { // If this ability can be activated while holding it
								(function (action, actionObj, object) {
									commandList[action + ' ' + object] = function (world, gameState, options, callback) {
										self.textyObj.objectModules[actionObj.module][actionObj.method](self.textyObj.controllers.interface(world, gameState), options, callback);
									}
								})(action, actionObj, object);
							}

						}
					}
				}

				// Start a conversation with an npc
				commandList['talk to'] = function (world, gameState, options, callback) {
					self.textyObj.controllers.game.startConversation(world, gameState, options, callback);
				}
				

				break;

		}

		return commandList;

	}


	// Assign to exports
	return function (textyObj) {
		return (new CommandParser(textyObj));
	};

});
