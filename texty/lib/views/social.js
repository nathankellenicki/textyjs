define(['texty/lib/utils', 'mustache'],
function (utils, Mustache) {

	// Load modules
	var Utils = utils();

	// Create the constructor
	var SocialView = function () {
	    console.log('SocialView initialized');
	}


	// Display local players inthe area (Different behaviour for public vs instanced rooms)
	SocialView.prototype.displayLocalPlayers = function (world, gameState, players) {
		
		var playerList = [],
			msg = '';

		for (var player in players) {
			if (players[player].warehouse.position == gameState.warehouse.position) {
				playerList.push(player);
			}
		}

		return Mustache.render(gameState.template.social.area.players, {
            players: playerList
        });

	}


	// Assign to exports
	return function () {
		return (new SocialView());
	};

});