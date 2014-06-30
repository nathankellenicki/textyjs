define([
    'mustache',
    'texty/lib/views/game'
],
function (Mustache, gameView) {

    // Create the constructor
    var GameController = function (textyObj) {

    	var self = this;

    	self.view = gameView();
        self.textyObj = textyObj;
        console.log('GameController initialized');

    }


    // Welcome method
    GameController.prototype.welcome = function (world, gameState) {
        return this.view.displayWelcome(world, gameState);
    }


    // Switch rooms method
    GameController.prototype.switchRooms = function (world, gameState, room, callback) {

        var roomObj = world.rooms[room];

        // Check if this is an instanced room, and deny entry unless the user is in a party. (NOTE: Check that the social module is loaded before caring!)
        if (!roomObj.instanced || (roomObj.instanced && gameState.party)) {
            gameState.warehouse.position = room;
            gameState.roomHistory.push(roomObj);
            // Replace the world before displaying
            world = ((this.textyObj.world.rooms[gameState.warehouse.position].instanced && gameState.party) ? gameState.world : this.textyObj.world);
            callback(this.view.displayRoom(world, gameState, room));
        } else {
            callback(Mustache.render(gameState.template.game.directions.instanced));
        }

        return gameState;

    }


    // Show inventory method
    GameController.prototype.displayInventory = function (world, gameState, callback) {
        callback(this.view.displayInventory(world, gameState));
    }


    // Show room method
    GameController.prototype.displayDirections = function (world, gameState, room, callback) {
        callback(this.view.displayDirections(world, gameState, room));
    }


    // Show items method
    GameController.prototype.displayItems = function (world, gameState, room, callback) {
        callback(this.view.displayItems(world, gameState, room));
    }


    // Look at item method
    GameController.prototype.lookAtItem = function (world, gameState, item, callback) {

        if (world.rooms[gameState.warehouse.position].objects[item] || gameState.warehouse.inventory[item]) {
            callback(this.view.displayItem(world, gameState, item));
        } else {
            callback(Mustache.render(gameState.template.game.items.notfound, {
                name: item
            }));
        }

    }


    // Pick up item method
    GameController.prototype.pickUpItem = function (world, gameState, item, callback) {

        if (world.rooms[gameState.warehouse.position].objects[item] && world.rooms[gameState.warehouse.position].objects[item] >= 1) {

            if (typeof world.objects[item].attainable === "undefined" || world.objects[item].attainable) {

                // Remove the item from the world and place it in the inventory
                if (!gameState.warehouse.inventory[item]) {
                    gameState.warehouse.inventory[item] = 0;
                }

                gameState.warehouse.inventory[item]++;
                world.rooms[gameState.warehouse.position].objects[item]--;

                if (world.rooms[gameState.warehouse.position].objects[item] <= 0) {
                    delete world.rooms[gameState.warehouse.position].objects[item];
                }

                callback(this.view.pickUpItem(world, gameState, item));

            } else {
                callback(Mustache.render(gameState.template.game.items.notattainable, {
                    name: item
                })); 
            }

        } else {
            callback(Mustache.render(gameState.template.game.items.notfound, {
                name: item
            }));
        }

    }


    // Drop item method
    GameController.prototype.dropItem = function (world, gameState, item, callback) {

        if (gameState.warehouse.inventory[item] && gameState.warehouse.inventory[item] >= 1) {

            // Remove the item from the inventory and place it in the world
            if (!world.rooms[gameState.warehouse.position].objects[item]) {
                world.rooms[gameState.warehouse.position].objects[item] = 0;
            }

            world.rooms[gameState.warehouse.position].objects[item]++;
            gameState.warehouse.inventory[item]--;

            if (gameState.warehouse.inventory[item] <= 0) {
                delete gameState.warehouse.inventory[item];
            }
            
            callback(this.view.dropItem(world, gameState, item));

        } else {
            callback(Mustache.render(gameState.template.game.items.notdropable, {
                name: item
            }));
        }

    }


    // Assign to exports
    return function (textyObj) {
    	return (new GameController(textyObj));
    };

});