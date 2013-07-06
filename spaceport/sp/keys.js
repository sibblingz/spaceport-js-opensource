define('sp/keys', [
	'sp/Dictionary',
	'sp/shouldStringifyKey'
], function(
	Dictionary,
	shouldStringifyKey
) {
	function makeKey(key) {
		if(shouldStringifyKey(key)) {
			var asNumber = Number(key);
			return isNaN(asNumber)
				? String(key)
				: asNumber;
		}
		return key;
	}
	return function keys(container) {
		var keyNames = container instanceof Dictionary
			? container.__keys__.concat(Object.keys(container))
			: container === Object(container)
				? Object.keys(container)
				: [];
		return keyNames.map(makeKey);
	};
});
