define('sp/unset', [
	'sp/Dictionary',
	'sp/normalizeKey',
	'sp/shouldStringifyKey'
], function(
	Dictionary,
	normalizeKey,
	shouldStringifyKey
) {
	return function unset(container, key) {
		if(container instanceof Dictionary) {
			key = normalizeKey(key);
			if(shouldStringifyKey(key)) {
				delete container[key];
				return true;
			}
			var index = container.__keys__.indexOf(key);
			if(index >= 0) {
				container.__keys__.splice(index, 1);
				container.__values__.splice(index, 1);
			}
			return true;
		} else {
			return delete container[key];
		}
	};
});
