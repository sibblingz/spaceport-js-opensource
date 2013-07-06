define('util/js/nameFunction', [], function() {
	function sanitizeJSIdentifier(x) {
		return x
			.replace(/^[^a-z$_]/i, '_')
			.replace(/[^a-z$_0-9]/ig, '_');
	}

	/**
	 * Returns a new function named name.
	 * This is for Chrome and prototype names, since it doesn't like it otherwise
	 */
	return function __name_function(name, f) {
		name = sanitizeJSIdentifier(name);
		return Function('f', 'return function '+name+'(){return f.apply(this,arguments)}')(f);
	};
});
