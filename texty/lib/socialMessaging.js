define(['texty/lib/utils', 'mustache'],
function (utils, Mustache) {

	// Load modules
	var Utils = utils();

	// Create the constructor
	var SocialMessaging = function (textyObj, config) {

		var self = this;

		self.modules = config;
		self.textyObj = textyObj;
	    console.log('SocialMessaging initialized');

	}


	// Display local players inthe area (Different behaviour for public vs instanced rooms)
	SocialMessaging.prototype.displayLocalPlayers = function (world, gameState) {
		
		var players = [],
			msg = '';

		for (var player in this.textyObj.players) {
			if (this.textyObj.players[player].position == gameState.position) {
				players.push(player);
			}
		}

		return Mustache.render(this.textyObj.template.social.area.players, {
            players: players
        });

	}


	// Assign to exports
	return function (textyObj, config) {
		return (new SocialMessaging(textyObj, config));
	};

});