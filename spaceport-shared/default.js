define('shared/default', [], function() {
	/**
	 * Given 'input' and default,
	 * will return default if nothing was given as input, with same type
	 */
	return function(input, def) {
		if(typeof input === 'undefined')
			return def;
		
		if(def == null)
			return input;
		
		return def.constructor(input);
	};
});
