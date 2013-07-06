define('util/error/coercionFailed', [
	'flash/utils/getQualifiedClassName'
], function(
	getQualifiedClassName
) {
	function objectName(obj) {
		switch(typeof obj) {
			case 'number': return String(obj);
			default: return getQualifiedClassName(obj);
		}
	}

	return function coercionFailed(obj, className) {
		throw new TypeError("Type Coercion failed: cannot convert " + objectName(obj) + " to " + className + ".");
	};
});
