define('flash/StaticText', [
	'flash/InteractiveObject',
	'display/ShapeDisplayList',
	'util/lightClass'
], function(
	InteractiveObject,
	ShapeDisplayList,
	lightClass
) {
	var StaticText = lightClass(InteractiveObject, {
		constructor: function StaticText(bounds, selector) {
			this.displayList = new ShapeDisplayList(selector, bounds);
			this.bounds = bounds;
			this.selector = selector;
		},
		'isEventTarget': false,
		'writeDescriptor': function writeDescriptor(object) {
			InteractiveObject.prototype.writeDescriptor.call(this, object);
			object.$ = 'StaticText';
			object.bounds = this.bounds.slice();
		},
		'clone': function clone() {
			var cloned = new StaticText(this.bounds, this.selector);
			this.cloneInto(cloned);
			this.displayList.copyEffectsTo(cloned.displayList);
			return cloned;
		}
	});

	StaticText.fromElement = function fromElement(element) {
		var viewBox = element.viewBox.baseVal;
		var selector = '#' + element.getAttribute('id')

		return new StaticText([viewBox.x, viewBox.y, viewBox.width, viewBox.height], selector);
	};

    return StaticText;
});
