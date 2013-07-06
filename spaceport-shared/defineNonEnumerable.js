define('shared/defineNonEnumerable', [
	'shared/defineProperty'
], function(
	defineProperty
) {
	return function defineNonEnumerable(object, name, value) {
		defineProperty(object, name, {
			enumerable: false,
			value: value
		});
	};
});
