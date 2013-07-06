define('sp/normalizeKey', [
], function(
) {
	return function normalizeKey(key) {
		if(key instanceof String
			|| key instanceof Number
			|| key instanceof Boolean) {
			return key.valueOf();
		} else {
			return key;
		}
	};
});
