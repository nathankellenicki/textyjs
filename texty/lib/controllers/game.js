define([
    'mustache',
    'texty/lib/views/game',
    'texty/lib/utils'
],
function (Mustache, gameView, utils) {

    // Load modules
    var Utils = utils();

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


    // Help method
    GameController.prototype.commandList = function (gameState, commandList, callback) {
        callback(this.view.displayCommandList(gameState, Utils.objectProperties(commandList)));
    }


    // Switch rooms method
    GameController.prototype.switchRooms = function (world, gameState, room, callback) {

        // Check if this is an instanced room, and deny entry unless the user is in a party, or unless the user is in an instanced room already. (NOTE: Check that the social module is loaded before caring!)
        if (!world.rooms[room].instanced || (world.rooms[room].instanced && gameState.party) || (gameState.roomHistory > 0 && gameState.world.rooms[gameState.roomHistory[gameState.roomHistory.length - 1]].instanced)) {
            gameState.warehouse.position = room;
            gameState.roomHistory.push(room);
            // Replace the world before displaying
            world = ((this.textyObj.world.rooms[gameState.warehouse.position].instanced && gameState.party) ? gameState.world : this.textyObj.world);
            callback(this.view.displayRoom(world, gameState, room));

            // Clean up user by deleting their world if they are no longer in a party and it's not an instanced room
            if (!world.rooms[room].instanced && !gameState.party) {
                delete gameState.world;
                if (gameState.partyTimer) {
                    clearTimeout(gameState.partyTimer);
                }
            }

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


    // Start a conversation with an NPC
    GameController.prototype.startConversation = function (world, gameState, name, callback) {

        var Texty = this.textyObj,
            character = false;

        for (var npc in world.npcs) {
            if (world.npcs[npc].name.toLowerCase() == name.toLowerCase()) {
                character = world.npcs[npc];
            }
        }

        if (character) {

            gameState.state = {
                type: Texty.PlayerState.NPC_CONVERSATION,
                npcRef: character,
                conversationPoint: character.conversation
            }

            callback(this.view.showConversation(world, gameState));

        } else {
            callback(Mustache.render(gameState.template.game.characters.doesntexist));
        }

    }


    // Action a conversation choice
    GameController.prototype.conversationChoice = function (world, gameState, choice, callback) {
        
        var Texty = this.textyObj,
            msg = '';

        choice = (parseInt(choice, 10) - 1);

        // I'm not too keen on this next few lines...additional work needed.
        var them = gameState.state.conversationPoint.you[choice].them;

        gameState.state.conversationPoint = gameState.state.conversationPoint.you[choice].them;

        if (them) {
            msg = this.view.showConversation(world, gameState);
        }

        if (!gameState.state.conversationPoint || !gameState.state.conversationPoint.you || (gameState.state.conversationPoint.you && gameState.state.conversationPoint.you.length <= 0)) {

            msg += Mustache.render(gameState.template.game.characters.endconversation, {
                name: gameState.state.npcRef.name
            });

            gameState.state = {
                type: Texty.PlayerState.ROOM
            }

        }

        callback(msg);

    }


    // Stop talking to a character
    GameController.prototype.stopTalking = function (world, gameState, callback) {

        var Texty = this.textyObj;

        callback(Mustache.render(gameState.template.game.characters.endconversation, {
            name: gameState.state.npcRef.name
        }));

        gameState.state = {
            type: Texty.PlayerState.ROOM
        }

    }



    // Assign to exports
    return function (textyObj) {
    	return (new GameController(textyObj));
    };

});