define([
    'texty/lib/utils'
],
function (utils) {

    // Load modules
    var Utils = utils();

    // Create the constructor
    var ObjectInterfaceController = function (textyObj, world, gameState) {

    	var self = this;

        self.textyObj = textyObj;
        self.world = world;
        self.gameState = gameState;

    }


    // Interface methods start
    ObjectInterfaceController.prototype.setDescription = function (objName, description) {
    	this.world.objects[objName].description = description;
    }



    // Assign to exports
    return function (textyObj, world, gameState) {
    	return (new ObjectInterfaceController(textyObj, world, gameState));
    };

});