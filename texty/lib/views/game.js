define(['texty/lib/utils', 'mustache'],
function (utils, Mustache) {

	// Load modules
	var Utils = utils();

	// Create the constructor
	var GameView = function () {
	    console.log('GameView initialized');
	}


	// Format the display
	GameView.prototype.displayWelcome = function (world, gameState) {

	    return Mustache.render(gameState.template.game.welcome, {
	    	title: world.title,
	    	greeting: world.greeting
	    });

	}


	// Format the command list
	GameView.prototype.displayCommandList = function (gameState, commandList) {

	    return Mustache.render(gameState.template.game.help, {
	    	commands: commandList
	    });

	}


	// Format room display
	GameView.prototype.displayRoom = function (world, gameState, room) {

		var msg = '';

	    msg += Mustache.render(gameState.template.game.room, {
	    	description: world.rooms[room].description
	    });

	    msg += this.displayDirections(world, gameState, room);
	    msg += this.displayItems(world, gameState, room);
	    msg += this.displayCharacters(world, gameState, room);

	    return msg;

	}

	// Format directions display
	GameView.prototype.displayDirections = function (world, gameState, room) {

		var exits = world.rooms[room].exits,
			msg = '';

		if (Utils.numProperties(exits) > 0) {

			var directions = [];

			for (var room in exits) {
				directions.push({
					direction: room,
					description: exits[room].description
				});
			}

			msg = Mustache.render(gameState.template.game.directions.exists, {
				directions: directions
			});

		} else {
			msg = Mustache.render(gameState.template.game.directions.none);
		}
		
		return msg;

	}

	// Format room items display
	GameView.prototype.displayItems = function (world, gameState, room) {

		var objects = world.rooms[room].objects,
			msg = '';

		if (Utils.numProperties(objects) > 0) {

			var items = [];

			for (var item in objects) {
				if (objects[item] >= 1) {
					items.push({
						count: objects[item],
						name: item
					});
				}
			}

			msg = Mustache.render(gameState.template.game.items.listing.items, {
				items: items
			});

		} else {
			msg = Mustache.render(gameState.template.game.items.listing.noitems);
		}

		return msg;

	}


	// Show items in inventory
	GameView.prototype.displayInventory = function (world, gameState) {

		var msg = '';

		if (Utils.numProperties(gameState.warehouse.inventory) > 0) {

			var items = [];

			for (var item in gameState.warehouse.inventory) {
				if (gameState.warehouse.inventory[item] >= 1) {
					items.push({
						count: gameState.warehouse.inventory[item],
						name: item
					});
				}
			}

			msg = Mustache.render(gameState.template.game.inventory.listing.items, {
				items: items
			});

		} else {
			msg = Mustache.render(gameState.template.game.inventory.listing.noitems);
		}

		return msg;

	}


	// Show the characters
	GameView.prototype.displayCharacters = function (world, gameState, room) {

		var npcs = world.rooms[room].npcs,
			msg = '';

		if (npcs && npcs.length > 0) {		

			var characters = [];

			for (var npc in npcs) {
				if (world.npcs[npcs[npc]]) {

					npcObj = world.npcs[npcs[npc]];
					characters.push({
						name: npcObj.name,
						description: npcObj.description
					});

				}
			}

			msg = Mustache.render(gameState.template.game.characters.show, {
				characters: characters
			});

		} else {
			msg = Mustache.render(gameState.template.game.characters.none);
		}

		return msg;

	}


	// Display item (Look at item)
	GameView.prototype.displayItem = function (world, gameState, item) {
		return Mustache.render(gameState.template.game.items.lookat, {
			description: world.objects[item].description
		});
	}


	// Pick up item (Look at item)
	GameView.prototype.pickUpItem = function (world, gameState, item) {
		return Mustache.render(gameState.template.game.items.pickup, {
			name: item
		});
	}


	// Drop item (Look at item)
	GameView.prototype.dropItem = function (world, gameState, item) {
		return Mustache.render(gameState.template.game.items.drop, {
			name: item
		});
	}


	// Show current character conversation point
	GameView.prototype.showConversation = function (world, gameState) {

		var msg = '',
			speak = {
				name: gameState.state.npcRef.name,
				say: gameState.state.conversationPoint.say
			};

		msg = Mustache.render(gameState.template.game.characters.speak, speak);

		if (gameState.state.conversationPoint.you && gameState.state.conversationPoint.you.length > 0) {

			speak.options = [];

			for (var option in gameState.state.conversationPoint.you) {

				speak.options.push({
					number: (parseInt(option, 10) + 1),
					say: gameState.state.conversationPoint.you[option].say
				})

			}

			msg += Mustache.render(gameState.template.game.characters.conversationoptions, speak);

		}

		return msg;

	}


	// Assign to exports
	return function () {
		return (new GameView());
	};

});