define('util/as3/geomToString', [], function() {
	/**
	 * Alternative AS3 .toString for common data structures
	 */
	return function __as3_toString(instance, args) {
		return '(' + [].slice.call(arguments, 1).map(function(property) {
			return [property, instance[property]].join('=');
		}, this).join(', ') + ')';
	};
});
