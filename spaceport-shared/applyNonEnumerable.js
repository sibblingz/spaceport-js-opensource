define('shared/applyNonEnumerable', [
	'shared/objectKeys',
	'shared/defineNonEnumerable'
], function(
	objectKeys,
	defineNonEnumerable
) {
	return function applyNonEnumerable(object, properties) {
		objectKeys(properties).forEach(function(key) {
			defineNonEnumerable(object, key, properties[key]);
		});
	};
});
