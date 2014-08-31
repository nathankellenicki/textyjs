define([
    'texty/lib/utils'
],
function (utils) {

    // Load modules
    var Utils = utils();

    // Create the constructor
    var PlayerInterfaceController = function (textyObj, world, gameState) {

    	var self = this;

        self.textyObj = textyObj;
        self.world = world;
        self.gameState = gameState;

    }


    // Interface methods start
    PlayerInterfaceController.prototype.removeObject = function (objName, quantity) {
        // WTF?! Change this IMMEDIATELY!!
    	this.gameState.warehouse.inventory[objName] = this.gameState.warehouse.inventory[objName] - quantity;
    }


    PlayerInterfaceController.prototype.addObject = function (objName, quantity) {
        if (!this.gameState.warehouse.inventory[objName]) {
            this.gameState.warehouse.inventory[objName] = 0;
        }

        this.gameState.warehouse.inventory[objName] = this.gameState.warehouse.inventory[objName] + quantity;
    }


    // Assign to exports
    return function (textyObj, world, gameState) {
    	return (new PlayerInterfaceController(textyObj, world, gameState));
    };

});