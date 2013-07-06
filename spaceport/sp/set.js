define('sp/set', [
	'sp/Dictionary',
	'sp/normalizeKey',
	'sp/shouldStringifyKey'
], function(
	Dictionary,
	normalizeKey,
	shouldStringifyKey
) {
	return function set(container, key, value) {
		if (container instanceof Dictionary) {
			key = normalizeKey(key);
			if(shouldStringifyKey(key)) {
				container[key] = value;
				return;
			}
			var index = container.__keys__.indexOf(key);
			if(index >= 0) {
				container.__values__[index] = value;
			} else {
				container.__keys__.push(key);
				container.__values__.push(value);
			}
		} else {
			container[key] = value;
		}
		return value;
	};
});
