define('util/error/argNull', [], function() {
	return function argNull(argumentName) {
		return new TypeError("Parameter " + argumentName + " must be non-null.");
	};
});
