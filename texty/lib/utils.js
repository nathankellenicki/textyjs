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

	Utils.prototype.objectProperties = function (obj) {

		var arr = [];

		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				arr.push(prop);
			}
		}

		return arr;

	}


	Utils.prototype.setTimeout = function (callback, delay) {
		return setTimeout(callback, delay);
	}

	return function () {
		return (new Utils());
	}

});