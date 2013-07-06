define('flash/text/StaticText', [
	'proxy/create',
	'flash/display/DisplayObject'
], function(
	createProxyClass,
	DisplayObject
) {
	return createProxyClass('StaticText', DisplayObject, {
		patch: function patch(target, patch, mutator) {
			mutator.patchObjectPropertiesReadOnly(target, patch, ['text', 'width', 'height']);
		},
		methods: {
			fake: {
				'text': {
					get: function() {
						return '';
					}
				}
			}
		}
	});
});
