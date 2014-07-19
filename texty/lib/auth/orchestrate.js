define(['util', 'orchestrate', 'crypto'],
function (util, orchestrate, crypto) {

	// Create the constructor
	var OrchestrateStore = function (config) {

	    self = this;

	    var config = config || {};
	    self.db = orchestrate(config.token);

	    console.log('Orchestrate auth module initialized');

	}

	// Initial start method
	OrchestrateStore.prototype.auth = function (username, password, callback) {

		var self = this;

		self.db.get('users', username).then(function (res) {
			// The user was found. Authenticate
			var user = res.body,
				hash = self._secureHash('sha512', user.salt + '' + password, 1000);

			if (user.password == hash) {
				callback(false, username); // Return success, password correct
			} else {
				callback(true); // Return fail, password incorrect
			}

		}).fail(function (err) {

			var salt = self._secureHash('sha512', +new Date() + '' + (Math.floor(Math.random() * 9999) + 1000), 1),
				hash = self._secureHash('sha512', salt + '' + password, 1000);

			// The user was not found. Create the user (Not, this should be done through a website), normally this should fail
			self.db.put('users', username, {
				salt: salt,
				username: username,
				password: hash
			}).then(function (res) {
				callback(false, username); // Return success, user created
			}).fail(function (err) {
				callback(true); // Return error, unknown error
			});

		});


	    //callback(false, username); // Return error false and userid 12345
	}

	OrchestrateStore.prototype.load = function (userId, callback) {
	    //callback(false, {}); // Return error false and a loaded user object
	    callback(true, null); // Return error true to say that there wasn't any user data found for this person.
	}

	OrchestrateStore.prototype._secureHash = function (type, str, numIterations) {
		if (numIterations > 0) {
			return this._secureHash(type, crypto.createHash(type).update(str).digest('hex'), --numIterations);
		} else {
			return str;
		}
	}

	return OrchestrateStore;

});