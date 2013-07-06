define('shared/hasProperty', [], function() {
	/**
	 * A cannonical way to determine if an object has a property by name
	 * 
	 * XXX: This can't be called hasOwnProperty since Opera thinks it's funny to
	 * have window.hasOwnProperty that always returns false, is non-overridable
	 * and apparently calls object.toString() for no apparent reason...
	 */
	return function hasProperty(object, propertyName) {
		return Object.prototype.hasOwnProperty.call(Object(object), propertyName);
	};
});
