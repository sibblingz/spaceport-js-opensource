define('sp/shouldStringifyKey', [
], function(
) {
	return function shouldStringifyKey(key) {
		return key === null || typeof(key) !== "object";
	};
});
