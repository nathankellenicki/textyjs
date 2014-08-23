define([
    'texty/lib/controllers/interface/objects',
    'texty/lib/controllers/interface/players',
    'texty/lib/utils'
],
function (
    objectInterfaceController,
    playerInterfaceController,
    utils
) {

    // Load modules
    var Utils = utils();

    // Create the constructor
    var InterfaceController = function (textyObj) {

    	var self = this;

        self.textyObj = textyObj;

        // Set different types of interfaces
        self.rooms = {}
        self.objects = objectInterfaceController(this.textyObj);
        self.npcs = {}
        self.party = {}
        self.players = playerInterfaceController(this.textyObj);

        console.log('InterfaceController initialized');

    }

    // Assign to exports
    return function (textyObj) {
    	return (new InterfaceController(textyObj));
    };

});



/* Features:

1. Manipulate world
2. Manipulate party (And party world)
3. Manipulate player
4. Manipulate other players

*/

