define(['util'],
function (util) {

	// Create the constructor
	var RedisStore = function (config) {

	    self = this;

	    var config = config || {};

	    console.log('Redis auth module initialized');

	}

	// Initial start method
	RedisStore.prototype.auth = function (username, password, callback) {
	    callback(false, username); // Return error false and userid 12345
	}

	RedisStore.prototype.load = function (userId, callback) {
	    //callback(false, {}); // Return error false and a loaded user object
	    callback(true, null); // Return error true to say that there wasn't any user data found for this person.
	}

	return RedisStore;

});