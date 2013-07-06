define('util/as3/makeClassToString', [], function() {
	return function makeClassToString(name) {
		return function toString() {
			return '[class ' + name + ']';
		};
	};
});
