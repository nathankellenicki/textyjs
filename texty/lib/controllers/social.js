define([
	'mustache',
	'texty/lib/views/social',
	'texty/lib/utils'
],
function (Mustache, socialView, utils) {

	// Load modules
	var Utils = utils();

	// Create the constructor
	var SocialController = function (textyObj) {

		var self = this;

		self.view = socialView();
	    self.textyObj = textyObj;
	    console.log('SocialController initialized');

	}


	// Send game info to a user
	SocialController.prototype.sendInfo = function (gameState, toPlayer, message, callback) {
		if (this.textyObj.triggerGameEvent(this.textyObj.players[toPlayer], message)) {
			if (callback) {
				callback(Mustache.render(gameState.template.social.messaging.sent));
			}
		} else {
			if (callback) {
				callback(Mustache.render(gameState.template.social.messaging.notsent, {
		            toPlayer: toPlayer
		        }));
			}
		}
	}


	// Display all players in the vicinity (Different behaviour for public vs instanced room)
	SocialController.prototype.displayLocalPlayers = function (world, gameState, callback) {
		var players = ((world.rooms[gameState.warehouse.position].instanced && gameState.party) ? gameState.party.players : this.textyObj.players);
		callback(this.view.displayLocalPlayers(world, gameState, players));
	}


	// Send a message to a user
	SocialController.prototype.sendMessage = function (gameState, toPlayer, message, callback) {
		this.sendInfo(gameState, toPlayer, Mustache.render(this.textyObj.players[toPlayer].template.social.messaging.received, {
            fromPlayer: gameState.player,
            message: message
        }), callback);
	}


	// Invite a user to a party
	SocialController.prototype.inviteToParty = function (gameState, toPlayer, callback) {

		// It's yourself stupid!
		if (gameState.player == toPlayer) {
			callback(Mustache.render(gameState.template.social.party.cannotinviteself));
			return;
		}

		// Player doesn't exist!
		if (!this.textyObj.players[toPlayer]) {
			callback(Mustache.render(gameState.template.social.party.playerdoesntexist, {
				toPlayer: toPlayer
			}));
			return;
		}

		// If toPlayer is already in a party, decline party invite.
		if (!!this.textyObj.players[toPlayer].party) {
			callback(Mustache.render(gameState.template.social.party.alreadyinparty));
			return;
		} else {
			
			// Is the fromPlayer already in a party? If not, create a party and instantiate the party world (PARTAYHOUSE!!!)
			if (!gameState.party) {

				var newParty = {
					world: this.textyObj.instantiateWorld(),
					players: {}
				};

				newParty.players[gameState.player] = gameState;

				this.textyObj.parties.push(newParty);
				gameState.party = newParty;

			}

			// Add the toPlayer to the party (Which should now exist, regardless)
			gameState.party.players[toPlayer] = this.textyObj.players[toPlayer];
			this.textyObj.players[toPlayer].party = gameState.party;
			this.sendInfo(gameState, toPlayer, Mustache.render(this.textyObj.players[toPlayer].template.social.party.addedby, {
				fromPlayer: gameState.player
			}));
			callback(Mustache.render(gameState.template.social.party.successfullyadded, {
				toPlayer: toPlayer
			}));

		}

	}


	// Assign to exports
	return function (textyObj) {
		return (new SocialController(textyObj));
	};

});