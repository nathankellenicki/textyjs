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
		if (this.textyObj.triggerGameEvent('gameEvent', this.textyObj.players[toPlayer], message)) {
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
		var players = ((world.rooms[gameState.warehouse.position].instanced && gameState.party) ? gameState.party : this.textyObj.players);
		callback(this.view.displayLocalPlayers(world, gameState, players));
	}


	// Send a message to a user
	SocialController.prototype.sendMessage = function (gameState, toPlayer, message, callback) {
		
		// Player doesn't exist
		if (!this.textyObj.players[toPlayer]) {
			callback(Mustache.render(gameState.template.social.messaging.playerdoesntexist, {
				toPlayer: toPlayer
			}));
			return;
		}

		this.sendInfo(gameState, toPlayer, Mustache.render(this.textyObj.players[toPlayer].template.social.messaging.received, {
            fromPlayer: gameState.player,
            message: message
        }), callback);

	}


	// Send a message to a party
	SocialController.prototype.sendPartyMessage = function (gameState, message, callback) {

		if (!gameState.party) {
			// You are not in a party
			callback(Mustache.render(gameState.template.social.party.notinparty));
			return;
		}

		// Send message to all
		for (var player in gameState.party) {
			if (gameState.player != player) {
				this.sendMessage(gameState, player, message);
			}
		}

		callback(Mustache.render(gameState.template.social.messaging.sent));

	}


	// Invite a user to a party
	SocialController.prototype.inviteToParty = function (gameState, toPlayer, callback) {

		var Texty = this.textyObj;

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

		// Player already has a pending party invite
		if (this.textyObj.players[toPlayer].state.type == Texty.PlayerState.PARTY_INVITE) {
			callback(Mustache.render(gameState.template.social.party.pendinginvite));
			return;
		}

		// Player is in an instanced area
		if (this.textyObj.players[toPlayer].world && this.textyObj.players[toPlayer].world.rooms[this.textyObj.players[toPlayer].warehouse.position].instanced) {
			callback(Mustache.render(gameState.template.social.party.ininstance));
			return;
		}

		// If toPlayer is already in a party, decline party invite.
		if (!!this.textyObj.players[toPlayer].party) {
			callback(Mustache.render(gameState.template.social.party.alreadyinparty));
			return;
		} else {

			this.textyObj.players[toPlayer].state = {
				type: Texty.PlayerState.PARTY_INVITE,
				fromPlayer: gameState.player
			}

			this.sendInfo(gameState, toPlayer, Mustache.render(this.textyObj.players[toPlayer].template.social.party.invitereceived, {
				fromPlayer: gameState.player
			}));

			callback(Mustache.render(gameState.template.social.party.invitesent, {
				toPlayer: toPlayer
			}));

		}

	}


	// Decline party invite
	SocialController.prototype.declinePartyInvite = function (gameState, callback) {

		var Texty = this.textyObj;

		gameState.state = {
			type: Texty.PlayerState.ROOM
		}

		callback(Mustache.render(gameState.template.social.party.invitedeclined));

	}


	// Accept party invite
	SocialController.prototype.acceptPartyInvite = function (gameState, callback) {

		var Texty = this.textyObj;

		// Player doesn't exist!
		if (!this.textyObj.players[gameState.state.fromPlayer]) {
			callback(Mustache.render(gameState.template.social.party.playerdoesntexist, {
				toPlayer: gameState.state.fromPlayer
			}));
			return;
		}
			
		var fromPlayerGameState = this.textyObj.players[gameState.state.fromPlayer];

		// Is the fromPlayer already in a party? If not, create a party and instantiate the party world if the user isn't in one (PARTAYHOUSE!!!)
		if (!fromPlayerGameState.party) {

			var players = {};

			players[gameState.state.fromPlayer] = fromPlayerGameState;

			if (!fromPlayerGameState.world) {
				var world = this.textyObj.instantiateWorld();
				fromPlayerGameState.world = world;
			}
			fromPlayerGameState.party = players;

		}

		// Add the toPlayer to the party (Which should now exist, regardless)
		gameState.party = fromPlayerGameState.party;
		gameState.world = fromPlayerGameState.world;
		gameState.party[gameState.player] = gameState;

		// Notify all players that you are joining the party
		for (var player in gameState.party) {
			if (player != gameState.player) {
				this.sendInfo(gameState, player, Mustache.render(this.textyObj.players[player].template.social.party.playerjoined, {
					player: gameState.player
				}))
			}
		}

		// Notify player they've been added
		callback(Mustache.render(gameState.template.social.party.inviteaccepted));

		// Clear your instance exit timer if there is one running
		if (fromPlayerGameState.partyTimer) {
			clearTimeout(fromPlayerGameState.partyTimer);
		}

		// Put player back in ROOM state
		gameState.state = {
			type: Texty.PlayerState.ROOM
		}

		// Notify all other party members that you joined
		//callback(Mustache.render(gameState.template.social.party.playerjoined, {
		//	player: toPlayer
		//}));

	}


	// Drop party
	SocialController.prototype.dropParty = function (gameState, callback) {

		// If you're not in a party, fail
		if (!gameState.party) {
			callback(Mustache.render(gameState.template.social.party.notinparty));
			return;
		} else {

			// Notify all players that you are leaving the party
			for (var player in gameState.party) {
				if (player != gameState.player) {
					this.sendInfo(gameState, player, Mustache.render(this.textyObj.players[player].template.social.party.playerleft, {
						player: gameState.player
					}))
				}
			}

			// Remove the player from the players list of the party
			delete gameState.party[gameState.player];

			// If there is 1 or less people in the party after leaving, initiate the kickout process if necessary
			if (Utils.numProperties(gameState.party) == 1) { // We don't need to check for 0

				var lastPlayer = Utils.objectProperties(gameState.party)[0];

				delete gameState.party[lastPlayer];
				delete this.textyObj.players[lastPlayer].party; // This should free up the last reference?
				this.sendInfo(gameState, lastPlayer, Mustache.render(this.textyObj.players[lastPlayer].template.social.party.partydisbanded));

				if (this.textyObj.players[lastPlayer].world) {
					// Remove the world if not in instanced area
					if (!this.textyObj.players[lastPlayer].world.rooms[this.textyObj.players[lastPlayer].warehouse.position].instanced) {
						delete this.textyObj.players[lastPlayer].world;
					} else {
						// Start a timer if they are
						(function (gameState, self) {
							gameState.partyTimer = Utils.setTimeout(function () {
								self.kickFromInstance(gameState);
							}, 10 * 1000);
						})(this.textyObj.players[lastPlayer], this);
					}
				}

			}

			// Finally, drop the party
			delete gameState.party;

			if (gameState.world) {
				// Remove the world if not in an instanced area
				if (!gameState.world.rooms[gameState.warehouse.position].instanced) {
					delete gameState.world;
				} else {
					// Start a timer if they are
					(function (gameState, self) {
						gameState.partyTimer = Utils.setTimeout(function () {
							self.kickFromInstance(gameState);
						}, 10 * 1000);
					})(gameState, this);
				}
			}

			callback(Mustache.render(gameState.template.social.party.partydropped));

		}

	}


	// Kick out of room after leaving a party
	SocialController.prototype.kickFromInstance = function (gameState) {

		var self = this,
			world = (gameState.world ? gameState.world : self.textyObj.world);

		if (world.rooms[gameState.warehouse.position].instanced) {

			var room = null;

			// Select the last non instanced room
			for (var i = gameState.roomHistory.length - 1; i >= 0; i--) {
				if (!world.rooms[gameState.roomHistory[i]].instanced) {
					room = gameState.roomHistory[i];
					break;
				}
			}

			if (room)
			self.textyObj.controllers.game.switchRooms(world, gameState, room, function (msg) {
				self.sendInfo(gameState, gameState.player, Mustache.render(gameState.template.social.party.kickedfrominstance + msg));
			});

		}

	}


	// Assign to exports
	return function (textyObj) {
		return (new SocialController(textyObj));
	};

});
