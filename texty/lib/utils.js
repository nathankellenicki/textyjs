define(['nodejs-ansibuffer'],
function (Ansi) {

	var Utils = function () {}

	// Format a string with a special Ansi character
	Utils.prototype.ansi = function (ansi, str) {
		str = str || '';
		return (Ansi.ANSIChars.ESC + ansi + str + Ansi.ANSIChars.ESC + '0m');
	}

	// Find out how many properties an object/hash does
	Utils.prototype.numProperties = function (obj) {

		var count = 0;

		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				count++;
			}
		}

		return count;

	}

	return function () {
		return (new Utils());
	}

});