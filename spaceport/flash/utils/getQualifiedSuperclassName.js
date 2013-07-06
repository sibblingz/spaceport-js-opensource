define('flash/utils/getQualifiedSuperclassName', [
	'util/oop/getPrototypeOf',
	'flash/utils/getQualifiedClassName'
], function(
	getPrototypeOf,
	getQualifiedClassName
) {
	return function getQualifiedSuperclassName(value) {
		if(value == null) // Includes undefined
			return 'null';
		
		// Most likely a class
		if(typeof value === 'function')
			return getQualifiedClassName(value.prototype);

		// Flash returns 'Object' for all primitives
		if(typeof value !== 'object')
			return 'Object';
		
		// Instance, use the prototype as superclass
		return getQualifiedClassName(getPrototypeOf(value));
	};
});
