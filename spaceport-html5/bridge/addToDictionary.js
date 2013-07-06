define('bridge/addToDictionary', [
	'bridge/dictionary'
], function(
	dictionary
) {
	return function addToDictionary(id, object) {
		dictionary[id] = object;
		object.id = id;
	};
});
