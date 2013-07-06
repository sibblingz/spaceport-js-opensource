define('util/oop/className', [], function() {
	/**
	 * Given an object instance, return the class name as a string
	 */
	return function __class_name(instance) {
		if(instance == null)
			return String(instance);

		return instance.constructor
			? instance.constructor.name
			: '<unknown>';
	};
});
