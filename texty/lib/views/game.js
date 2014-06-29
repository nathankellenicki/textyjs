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


	// Format room display
	GameView.prototype.displayRoom = function (world, gameState, room) {

		var msg = '';
	    
	    msg += Mustache.render(gameState.template.game.room, {
	    	description: world.rooms[room].description
	    });

	    msg += this.displayDirections(world, gameState, room);
	    msg += this.displayItems(world, gameState, room);

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

			msg += Mustache.render(gameState.template.game.directions.exists, {
				directions: directions
			});

		} else {
			msg += Mustache.render(gameState.template.game.directions.none);
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

			msg += Mustache.render(gameState.template.game.items.listing.items, {
				items: items
			});

		} else {
			msg += Mustache.render(gameState.template.game.items.listing.noitems);
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

			msg += Mustache.render(gameState.template.game.inventory.listing.items, {
				items: items
			});

		} else {
			msg = Mustache.render(gameState.template.game.inventory.listing.noitems);
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


	// Assign to exports
	return function () {
		return (new GameView());
	};

});