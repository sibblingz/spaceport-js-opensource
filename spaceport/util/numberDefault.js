define('util/numberDefault', [
	'util/builtin/isNaN'
], function(
	isNaN
) {
	/**
	 * Given 'input' and default,
	 * will return default if nothing was given as input as a Number
	 *
	 * This is here because __default(0, 0) will sometimes not work as expected
	 */
	return function __number_default(input, def) {
		if(isNaN(input))
			return def;
		
		return Number(input);
	};
});
