define('sp/createContext', [
	'bridge',
], function(
	bridge
) {
	// Creates and initializes a Spaceport context.  Since
	// Spaceport currently is a singleton, only one context
	// is allowed.
	//
	// After a context is created, you can call .init to
	// set up the stage with a document class.

	var contextCreated = false;

	return function createContext(callback, options) {
		if(contextCreated)
			throw new Error("Cannot create more than one Spaceport context");
		if(typeof callback !== 'function')
			throw new Error("createContext accepts a callback function");

		contextCreated = true;

		bridge.load(options || {}, function() {
			var global = (function() { return this; }());
			var sp = global.sp;  // HACK
			callback(null, sp);
		});
	};
});
