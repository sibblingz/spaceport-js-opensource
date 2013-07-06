define('util/errorDeveloper', [
	'shared/version'
], function(
	SPACEPORT_VERSION
) {
	// errorDeveloper is used when the developer makes a mistake using
	// Spaceport (not Flash) which causes the runtime to be in an undefined or
	// unuseable state.
	//
	// For example, access `this` on non-bound methods should alert the
	// developer using errorDeveloper.
	if(CUSTOMER_DEBUG || DEBUG) {
		return function errorDeveloper(message, url) {
			if(url) {
				message += "\nFor more information, please visit: "
					+ url.replace(/@docs@/, "http://docs.spaceport.io/" + SPACEPORT_VERSION);
			}

			console.error(message);
			throw new Error(message);
		};
	} else {
		return function errorDeveloper() {
			// Do nothing
		};
	}
});
