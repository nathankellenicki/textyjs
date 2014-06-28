define(['texty/lib/utils', 'mustache'],
function (utils, Mustache) {

	// Load modules
	var Utils = utils();

	// Create the constructor
	var GameMessaging = function (textyObj, config) {

		var self = this;

		self.modules = config;
		self.textyObj = textyObj;
	    console.log('GameMessaging initialized');

	}


	// Format the display
	GameMessaging.prototype.displayWelcome = function (world) {

	    return Mustache.render(this.textyObj.template.game.welcome, {
	    	title: world.title,
	    	greeting: world.greeting
	    });

	}


	// Format room display
	GameMessaging.prototype.displayRoom = function (world, gameState, room) {

		var msg = '';
	    
	    msg += Mustache.render(this.textyObj.template.game.room, {
	    	description: world.rooms[room].description
	    });

	    msg += this.displayDirections(world, gameState, room);
	    msg += this.displayItems(world, gameState, room);

	    return msg;

	}

	// Format directions display
	GameMessaging.prototype.displayDirections = function (world, gameState, room) {

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

			msg += Mustache.render(this.textyObj.template.game.directions.exists, {
				directions: directions
			});

		} else {
			msg += Mustache.render(this.textyObj.template.game.directions.none);
		}
		
		return msg;

	}

	// Format room items display
	GameMessaging.prototype.displayItems = function (world, gameState, room) {

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

			msg += Mustache.render(this.textyObj.template.game.items.listing.items, {
				items: items
			});

		} else {
			msg += Mustache.render(this.textyObj.template.game.items.listing.noitems);
		}

		return msg;

	}


	// Show items in inventory
	GameMessaging.prototype.displayInventory = function (world, gameState) {

		var msg = '';

		if (Utils.numProperties(gameState.inventory) > 0) {

			var items = [];

			for (var item in gameState.inventory) {
				if (gameState.inventory[item] >= 1) {
					items.push({
						count: gameState.inventory[item],
						name: item
					});
				}
			}

			msg += Mustache.render(this.textyObj.template.game.inventory.listing.items, {
				items: items
			});

		} else {
			msg = Mustache.render(this.textyObj.template.game.inventory.listing.noitems);
		}

		return msg;

	}


	// Display item (Look at item)
	GameMessaging.prototype.displayItem = function (world, gameState, item) {
		return Mustache.render(this.textyObj.template.game.items.lookat, {
			description: world.objects[item].description
		});
	}


	// Pick up item (Look at item)
	GameMessaging.prototype.pickUpItem = function (world, gameState, item) {
		return Mustache.render(this.textyObj.template.game.items.pickup, {
			name: item
		});
	}


	// Drop item (Look at item)
	GameMessaging.prototype.dropItem = function (world, gameState, item) {
		return Mustache.render(this.textyObj.template.game.items.drop, {
			name: item
		});
	}


	// Assign to exports
	return function (textyObj, config) {
		return (new GameMessaging(textyObj, config));
	};

});