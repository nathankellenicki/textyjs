define([],
function () {

	var Utils = function () {}

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