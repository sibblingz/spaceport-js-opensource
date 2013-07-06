define('bridge/removeFromDictionary', [
	'bridge/dictionary'
], function(
	dictionary
) {
	return function removeFromDictionary(object) {
		delete dictionary[object.id];
	};
});
