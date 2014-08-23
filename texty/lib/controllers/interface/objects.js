define([
    'texty/lib/utils'
],
function (utils) {

    // Load modules
    var Utils = utils();

    // Create the constructor
    var ObjectInterfaceController = function (textyObj) {

    	var self = this;

        self.textyObj = textyObj;


        console.log('ObjectInterfaceController initialized');

    }


    // Interface methods start
    ObjectInterfaceController.prototype.setDescription = function (objName, description) {
    	this.textyObj.world.objects[objName].description = description;
    }



    // Assign to exports
    return function (textyObj) {
    	return (new ObjectInterfaceController(textyObj));
    };

});