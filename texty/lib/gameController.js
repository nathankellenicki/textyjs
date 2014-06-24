// Create the constructor
var GameController = function (config) {

	var self = this;

	self.modules = config;
    console.log('GameController initialized');

}


// Switch rooms method
GameController.prototype.switchRooms = function (world, gameState, room, callback) {

    gameState.position = room;
    callback(this.modules.gameMessaging.displayRoom(world, gameState, room));

    return gameState;

}


// Show inventory method
GameController.prototype.displayInventory = function (world, gameState, callback) {
    callback(this.modules.gameMessaging.displayInventory(world, gameState));
}


// Show room method
GameController.prototype.displayDirections = function (world, gameState, room, callback) {
    callback(this.modules.gameMessaging.displayDirections(world, gameState, room));
}


// Show items method
GameController.prototype.displayItems = function (world, gameState, room, callback) {
    callback(this.modules.gameMessaging.displayItems(world, gameState, room));
}


// Look at item method
GameController.prototype.lookAtItem = function (world, gameState, item, callback) {

    if (world.rooms[gameState.position].objects[item] || gameState.inventory[item]) {
        callback(this.modules.gameMessaging.displayItem(world, gameState, item));
    } else {
        callback('Cannot find ' + item + '.\r\n\r\n');
    }

}


// Pick up item method
GameController.prototype.pickUpItem = function (world, gameState, item, callback) {

    if (world.rooms[gameState.position].objects[item] && world.rooms[gameState.position].objects[item] >= 1) {

        if (typeof world.objects[item].attainable === "undefined" || world.objects[item].attainable) {

            // Remove the item from the world and place it in the inventory
            if (!gameState.inventory[item]) {
                gameState.inventory[item] = 0;
            }

            gameState.inventory[item]++;
            world.rooms[gameState.position].objects[item]--;

            if (world.rooms[gameState.position].objects[item] <= 0) {
                delete world.rooms[gameState.position].objects[item];
            }

            callback(this.modules.gameMessaging.pickUpItem(world, gameState, item));

        } else {
            callback('Cannot pick up ' + item + '.\r\n\r\n');    
        }

    } else {
        callback('Cannot find ' + item + '.\r\n\r\n');
    }

}


// Drop item method
GameController.prototype.dropItem = function (world, gameState, item, callback) {

    if (gameState.inventory[item] && gameState.inventory[item] >= 1) {

        // Remove the item from the inventory and place it in the world
        if (!world.rooms[gameState.position].objects[item]) {
            world.rooms[gameState.position].objects[item] = 0;
        }

        world.rooms[gameState.position].objects[item]++;
        gameState.inventory[item]--;

        if (gameState.inventory[item] <= 0) {
            delete gameState.inventory[item];
        }
        
        callback(this.modules.gameMessaging.dropItem(world, gameState, item));

    } else {
        callback('Cannot drop ' + item + '.\r\n\r\n');
    }

}


// Assign to exports
module.exports = function (config) {
	return (new GameController(config));
};