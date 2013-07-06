define('shared/readOnlyThrower', [], function() {
	return function readOnlyThrower(propertyName, fqn) {
		var message = "Illegal write to read-only property"
			+ (propertyName ? " " + propertyName : "")
			+ (fqn ? " on " + fqn : "");

		return function() {
			throw new ReferenceError(message);
		};
	};
});
