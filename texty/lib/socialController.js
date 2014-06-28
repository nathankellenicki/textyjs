define(['mustache'],
function (Mustache) {

	// Create the constructor
	var SocialController = function (textyObj, config) {

		var self = this;

		self.modules = config;
	    self.textyObj = textyObj;
	    console.log('SocialController initialized');

	}


	// Send game info to a user
	SocialController.prototype.sendInfo = function (gameState, toPlayer, message, callback) {
		if (this.textyObj.triggerGameEvent(toPlayer, message)) {
			if (callback) {
				callback(Mustache.render(this.textyObj.template.social.messaging.sent));
			}
		} else {
			if (callback) {
				callback(Mustache.render(this.textyObj.template.social.messaging.notsent, {
		            toPlayer: toPlayer
		        }));
			}
		}
	}


	// Display all players in the vicinity (Different behaviour for public vs instanced room)
	SocialController.prototype.displayLocalPlayers = function (world, gameState, callback) {
		callback(this.modules.socialMessaging.displayLocalPlayers(world, gameState));
	}


	// Send a message to a user
	SocialController.prototype.sendMessage = function (gameState, toPlayer, message, callback) {
		this.sendInfo(gameState, toPlayer, Mustache.render(this.textyObj.template.social.messaging.received, {
            fromPlayer: gameState.player,
            message: message
        }), callback);
	}


	// Invite a user to a party
	SocialController.prototype.inviteToParty = function (gameState, toPlayer, callback) {

		// It's yourself stupid!
		if (gameState.player == toPlayer) {
			callback(Mustache.render(this.textyObj.template.social.party.cannotinviteself));
			return;
		}

		// Player doesn't exist!
		if (!this.textyObj.players[toPlayer]) {
			callback(Mustache.render(this.textyObj.template.social.party.playerdoesntexist, {
				toPlayer: toPlayer
			}));
			return;
		}

		// If toPlayer is already in a party, decline party invite.
		if (!!this.textyObj.players[toPlayer].party) {
			callback(Mustache.render(this.textyObj.template.social.party.alreadyinparty));
			return;
		} else {
			
			// Is the fromPlayer already in a party? If not, create a party and instantiate the party world (PARTAYHOUSE!!!)
			if (!gameState.party) {

				var newParty = {
					world: this.textyObj.instantiateWorld(),
					players: [gameState]
				};

				this.textyObj.parties.push(newParty);
				gameState.party = newParty;

			}

			// I was going to check if the player was already in the party, but you cannot invite a player that's already in a party, and I already check if it's the same person

			// Add the toPlayer to the party (Which should now exist, regardless)
			gameState.party.players.push(this.textyObj.players[toPlayer]);
			this.textyObj.players[toPlayer].party = gameState.party;
			this.sendInfo(gameState, toPlayer, Mustache.render(this.textyObj.template.social.party.addedby, {
				fromPlayer: gameState.player
			}));
			callback(Mustache.render(this.textyObj.template.social.party.successfullyadded, {
				toPlayer: toPlayer
			}));

		}

	}


	// Assign to exports
	return function (textyObj, config) {
		return (new SocialController(textyObj, config));
	};

});