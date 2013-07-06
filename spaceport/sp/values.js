define('sp/values', [
	'sp/Dictionary'
], function(
	Dictionary
) {
	return function values(container) {
		function sub(key) {
			return container[key];
		}
		return container instanceof Dictionary
			? container.__values__.concat(Object.keys(container).map(sub))
			: container === Object(container)
				? Object.keys(container).map(sub)
				: [];
	};
});
