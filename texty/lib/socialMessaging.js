// Load modules
var Utils = (require('./utils.js'))();

// Create the constructor
var SocialMessaging = function (textyObj, config) {

	var self = this;

	self.modules = config;
	self.textyObj = textyObj;
    console.log('SocialMessaging initialized');

}


// Display local players inthe area (Different behaviour for public vs instanced rooms)
SocialMessaging.prototype.displayLocalPlayers = function (world, gameState) {
	
	var playerList = [],
		msg = '';

	for (var player in this.textyObj.players) {
		if (this.textyObj.players[player].position == gameState.position) {
			playerList.push(player);
		}
	}

	msg = 'Players in the area:\r\n';
	msg += playerList.join('\r\n');
	msg += '\r\n\r\n';

	return msg;

}


// Assign to exports
module.exports = function (textyObj, config) {
	return (new SocialMessaging(textyObj, config));
};