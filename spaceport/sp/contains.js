define('sp/contains', [
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
	return function contains(container, key) {
		if(container instanceof Dictionary) {
			key = normalizeKey(key);
			return (shouldStringifyKey(key) && hasProperty(container, key))
					|| container.__keys__.indexOf(key) >= 0;
		} else {
			return key in container;
		}
	};
});
