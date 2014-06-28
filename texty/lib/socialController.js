define([],
function () {

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
				callback('Message sent.\r\n\r\n');
			}
		} else {
			if (callback) {
				callback('Could not send message to ' + toPlayer + '.\r\n\r\n');
			}
		}
	}


	// Display all players in the vicinity (Different behaviour for public vs instanced room)
	SocialController.prototype.displayLocalPlayers = function (world, gameState, callback) {
		callback(this.modules.socialMessaging.displayLocalPlayers(world, gameState));
	}


	// Send a message to a user
	SocialController.prototype.sendMessage = function (gameState, toPlayer, message, callback) {
		this.sendInfo(gameState, toPlayer, 'Message from ' + gameState.player + ': ' + message + '\r\n\r\n', callback);
	}


	// Invite a user to a party
	SocialController.prototype.inviteToParty = function (gameState, toPlayer, callback) {

		// It's yourself stupid!
		if (gameState.player == toPlayer) {
			callback('You cannot invite yourself to a party.\r\n\r\n');
			return;
		}

		// If toPlayer is already in a party, decline party invite.
		if (!!this.textyObj.players[toPlayer].party) {
			callback('Player is already in a party.\r\n\r\n');
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
			this.sendInfo(gameState, toPlayer, 'You were added to a party by ' + gameState.player + '.\r\n\r\n');
			callback('Added ' + toPlayer + ' to party.\r\n\r\n');

		}

	}


	// Assign to exports
	return function (textyObj, config) {
		return (new SocialController(textyObj, config));
	};

});