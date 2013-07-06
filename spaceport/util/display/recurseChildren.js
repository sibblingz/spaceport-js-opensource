define('util/display/recurseChildren', [
	'util/display/recurseDisplayObject'
], function(
	recurseDisplayObject
) {
	return function recurseChildren(displayObject, callback) {
		var children = displayObject.children;
		if(children) {
			children.forEach(function(child) {
				recurseDisplayObject(child, callback);
			});
		}
	};
});
