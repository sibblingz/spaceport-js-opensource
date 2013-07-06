define('display/StageDisplayList', [
	'display/DisplayListContainer',
	'util/lightClass'
], function(
	DisplayListContainer,
	lightClass
) {
	var StageDisplayList = lightClass(DisplayListContainer, {
		constructor: function StageDisplayList(element) {
			this.element = element;
		},
		'getBoundingPoints': function getBoundingPoints() {
			var w = this.element.clientWidth;
			var h = this.element.clientHeight;
			return this.getEffectiveTransformMatrix().transformPoints([
				[0, 0],
				[0, h],
				[w, h],
				[w, 0]
			]);
		},
		'isPureSvg': function isPureSvg() {
			return false;
		}
	});

	return StageDisplayList;
});
