// Require available modules here, before anything else
define(function () {

	exports = {}

	exports.extinguishCampfire = function (textyInterface, callback) {
		
		console.log('Ohai!');

		textyInterface.objects.setDescription('campfire', 'A small fire, recently extinguished.');
		callback('You stomp on the fire, putting the flames out.'); // Perhaps add custom text section to the templates and call it based on rendered text from this?

	}

	return exports;

});