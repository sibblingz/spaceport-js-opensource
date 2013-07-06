define('util/oop/instanceof', [], function() {
	return function __instanceof(obj, klass) {
		return obj instanceof klass;
	};
});
