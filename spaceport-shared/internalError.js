define('shared/internalError', [
	'shared/version'
], function(
	SPACEPORT_VERSION
) {
	// internalError is used when a fatal error (which is not a developer's
	// fault) occurs.  The fatal error prevents the program from continuing.
	return function internalError(id, message) {
		var message = "Internal Spaceport error " + id + " has occured"
			+ (message ? " with the following message: " + message : "")
			+ ".\nPlease report this issue to the Spaceport developers at: http://bugs.spaceport.io/";

		if(CUSTOMER_DEBUG || DEBUG) {
			console.error(message);
			if(typeof alert === 'function')
				alert(message);
		}

		throw new Error(message);
	};
});
