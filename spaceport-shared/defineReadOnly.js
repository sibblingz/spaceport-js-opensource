define('shared/defineReadOnly', [
	'shared/defineGetter'
], function(
	defineGetter
) {
	/**
	 * Defines a read-only property on an object
	 */
	return function defineReadOnly(instance, property, value) {
		defineGetter(instance, property, function() {
			return value;
		});
	};
});
