define([
    'texty/lib/utils'
],
function (utils) {

    // Load modules
    var Utils = utils();

    // Create the constructor
    var PlayerInterfaceController = function (textyObj) {

    	var self = this;

        self.textyObj = textyObj;

        console.log('PlayerInterfaceController initialized');

    }


    // Interface methods start
    PlayerInterfaceController.prototype.removeObject = function (objName, quantity) {
        // WTF?! Change this IMMEDIATELY!!
    	this.textyObj.players['nk'].warehouse.inventory[objName] = this.textyObj.players['nk'].warehouse.inventory[objName] - quantity;
    }



    // Assign to exports
    return function (textyObj) {
    	return (new PlayerInterfaceController(textyObj));
    };

});