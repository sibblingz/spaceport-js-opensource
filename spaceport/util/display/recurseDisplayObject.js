define('util/display/recurseDisplayObject', [], function() {
	return function recurseDisplayObject(displayObject, callback) {
		function recurse(displayObject) {
			callback(displayObject);

			var children = displayObject.children;
			if(children) {
				children.forEach(recurse);
			}
		}

		recurse(displayObject);
	};
});
