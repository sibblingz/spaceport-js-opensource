define('util/caps/capsOf', [
	'capabilities',
	'flash/utils/getQualifiedClassName'
], function(
	capabilities,
	getQualifiedClassName
) {
	return function capsOf(thing) {
		var name = getQualifiedClassName(thing);
		
		// Make sure to not trash those!
		if(!capabilities[name])
			capabilities[name] = {};
		
		return capabilities[name];
	};
});
