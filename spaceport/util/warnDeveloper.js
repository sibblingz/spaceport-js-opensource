define('util/warnDeveloper', [
	'shared/version'
], function(
	SPACEPORT_VERSION
) {
	// warnDeveloper is used when the developer makes a mistake using Spaceport
	// (not Flash).  The mistake made does not prevent the program from
	// continuing.
	//
	// For example, a version mismatch with the Spaceport library and the
	// Spaceport renderer should alert the developer using warnDeveloper.
	if(CUSTOMER_DEBUG || DEBUG) {
		return function warnDeveloper(message, url) {
			if(url) {
				message += "\nFor more information, please visit: "
					+ url.replace(/@docs@/, "http://docs.spaceport.io/" + SPACEPORT_VERSION);
			}

			console.warn(message);
		};
	} else {
		return function warnDeveloper() {
			// Do nothing
		};
	}
});
