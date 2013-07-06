define('display/MaskDisplayList', [
	'display/DisplayListContainer',
	'util/lightClass'
], function(
	DisplayListContainer,
	lightClass
) {
	var MaskDisplayList = lightClass(DisplayListContainer, {
		constructor: function MaskDisplayList(children, startDepth, endDepth) {
			// children used in super constructor

			this.startDepth = startDepth;
			this.endDepth = endDepth;
		}
	});

	return MaskDisplayList;
});
