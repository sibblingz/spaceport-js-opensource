define('util/nativeClasses', [
	'util/nativeClassNames'
], function(
	nativeClassNames
) {
	var globalObject = (function() { return this; }());
	return nativeClassNames.map(function(className) {
		return globalObject[className];
	});
});
