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
    var InterfaceController = function (world, gameState) {

    	var self = this;

        self.world = world;
        self.gameState = gameState;

        // Set different types of interfaces
        self.rooms = {}
        self.objects = objectInterfaceController(self.textyObj, self.world, self.gameState);
        self.npcs = {}
        self.party = {}
        self.players = playerInterfaceController(self.textyObj, self.world, self.gameState);

        console.log('InterfaceController initialized');

    }

    // Assign to exports

    return function (textyObj) {

        InterfaceController.prototype.textyObj = textyObj;
    	
        return function (world, gameState) {
            return (new InterfaceController(world, gameState));
        }

    };

});



/* Features:

1. Manipulate world
2. Manipulate party (And party world)
3. Manipulate player
4. Manipulate other players

*/

