define('util/defineReadOnlyArray', [
	'shared/defineGetter',
	'util/builtin/slice',
	'util/builtin/isArray'
], function(
	defineGetter,
	slice,
	isArray
) {
	/**
	 * Defines a read-only array on an object
	 */
	return function defineReadOnlyArray(instance, property, array) {
		if(!array || !isArray(array))
			array = null;
		else
			array = slice.call(array);

		defineGetter(instance, property, function() {
			return array ? array.slice() : null;
		});
	};
});
