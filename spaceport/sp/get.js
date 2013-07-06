define('sp/get', [
	'sp/Dictionary',
	'sp/normalizeKey',
	'sp/shouldStringifyKey',
	'shared/hasProperty'
], function(
	Dictionary,
	normalizeKey,
	shouldStringifyKey,
	hasProperty
) {
	return function get(container, key) {
		if(container instanceof Dictionary) {
			key = normalizeKey(key);
			if (shouldStringifyKey(key) && hasProperty(container, key))
				return container[key];
			var index = container.__keys__.indexOf(key);
			return index >= 0
				? container.__values__[index]
				: undefined;
		} else {
			return container[key];
		}
	};
});
