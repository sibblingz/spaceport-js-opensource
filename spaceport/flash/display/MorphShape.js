define('flash/display/MorphShape', [
	'proxy/create',
	'flash/display/DisplayObject'
], function(
	createProxyClass,
	DisplayObject
) {
	return createProxyClass('MorphShape', DisplayObject);
});
