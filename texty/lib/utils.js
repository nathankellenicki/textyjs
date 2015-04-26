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


	// Return an array of properties in an object/hash
	Utils.prototype.objectProperties = function (obj) {

		var arr = [];

		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				arr.push(prop);
			}
		}

		return arr;

	}


	// Wrapper for setting a timeout on different platforms
	Utils.prototype.setTimeout = function (callback, delay) {
		return setTimeout(callback, delay);
	}


	// Stripping a string of all non-essential characters
	Utils.prototype.stringClean = function (str) {
		return str.replace(/[^\w\s]/gi, '').trim();
	}


	return function () {
		return (new Utils());
	}

});