// Load modules
var Utils = (require('./utils.js'))();

// Create the constructor
var GameMessaging = function (textyObj, config) {

	var self = this;

	self.modules = config;
    console.log('GameMessaging initialized');

}


// Format the display
GameMessaging.prototype.displayWelcome = function (world) {

	//var msg = Utils.ansi('2J');
	var msg = '\r\n----------\r\n\r\n';

    msg += Utils.ansi('1m', world.title) + '\r\n\r\n';
    msg += world.greeting + '\r\n\r\n';

    msg += 'To continue, press ' + Utils.ansi('1m', 'enter') + '';

    return msg;

}


// Format room display
GameMessaging.prototype.displayRoom = function (world, gameState, room) {

	//var msg = Utils.ansi('2J');
	var msg = '\r\n----------\r\n\r\n';
    
    msg += world.rooms[room].description + '\r\n\r\n';
    msg += this.displayDirections(world, gameState, room);
    msg += this.displayItems(world, gameState, room);

    return msg;

}

// Format directions display
GameMessaging.prototype.displayDirections = function (world, gameState, room) {

	var exits = world.rooms[room].exits,
		msg = '';

	if (Utils.numProperties(exits) > 0) {

		msg += 'Directions:\r\n';

		for (var room in exits) {
			msg += Utils.ansi('1m', room) + ' ' + exits[room].description + '\r\n';
		}

		msg += '\r\n';

	} else {
		msg += 'There is nowhere you can go right now.\r\n\r\n';
	}
	
	return msg;

}

// Format room items display
GameMessaging.prototype.displayItems = function (world, gameState, room) {

	var objects = world.rooms[room].objects,
		msg = '';

	if (Utils.numProperties(objects) > 0) {

		msg += 'Items in the vicinity:\r\n';

		for (var item in objects) {
			if (objects[item] >= 1) {
				msg += objects[item] + 'x ' + Utils.ansi('1m', item) + '\r\n';
			}
		}

		msg += '\r\n';

	} else {
		msg += 'There are no items here.\r\n\r\n';
	}

	return msg;

}


// Show items in inventory
GameMessaging.prototype.displayInventory = function (world, gameState) {

	var msg = '';

	if (Utils.numProperties(gameState.inventory) > 0) {

		msg += 'Items in your inventory:\r\n';

		for (var item in gameState.inventory) {
			if (gameState.inventory[item] >= 1) {
				msg += gameState.inventory[item] + 'x ' + Utils.ansi('1m', item) + '\r\n';
			}
		}

		msg += '\r\n';

	} else {
		msg = 'There are no items in your inventory.\r\n\r\n';
	}

	return msg;

}


// Display item (Look at item)
GameMessaging.prototype.displayItem = function (world, gameState, item) {
	return world.objects[item].description + '\r\n\r\n';
}


// Pick up item (Look at item)
GameMessaging.prototype.pickUpItem = function (world, gameState, item) {
	return 'Picked up ' + item + '.\r\n\r\n';
}


// Drop item (Look at item)
GameMessaging.prototype.dropItem = function (world, gameState, item) {
	return 'Dropped ' + item + '.\r\n\r\n';
}


// Assign to exports
module.exports = function (textyObj, config) {
	return (new GameMessaging(textyObj, config));
};