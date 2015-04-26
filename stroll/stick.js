// Require available modules here, before anything else
define(function () {

	exports = {}

	exports.breakStick = function (interface, options, callback) {

		interface.players.removeObject('stick', 1);
		interface.players.addObject('brokenstick', 2);
		callback('You break the stick into two halves.'); // Perhaps add custom text section to the templates and call it based on rendered text from this?

	}

	return exports;

});