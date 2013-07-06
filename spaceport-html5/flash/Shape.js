define('flash/Shape', [
	'flash/DisplayObject',
	'display/ShapeDisplayList',
	'util/lightClass'
], function(
	DisplayObject,
	ShapeDisplayList,
	lightClass
) {
	var Shape = lightClass(DisplayObject, {
		constructor: function Shape(bounds, selector) {
			this.displayList = new ShapeDisplayList(selector, bounds);
			this.bounds = bounds;
			this.selector = selector;
		},
		'isEventTarget': false,
		'writeDescriptor': function writeDescriptor(object) {
			DisplayObject.prototype.writeDescriptor.call(this, object);
			object.$ = 'Shape';
			object.bounds = this.bounds.slice();

			delete object.matrix; // HACK
		},
		'cloneInto': function cloneInto(object) {
			DisplayObject.prototype.cloneInto.call(this, object);
			object.bounds = this.bounds.slice();
		},
		'clone': function clone() {
			var cloned = new Shape(this.bounds, this.selector);
			this.cloneInto(cloned);
			cloned.displayList = this.displayList.clone();
			return cloned;
		}
	});

	Shape.fromElement = function fromElement(element) {
		var viewBox = element.viewBox.baseVal;
		var selector = '#' + element.getAttribute('id')

		return new Shape([viewBox.x, viewBox.y, viewBox.width, viewBox.height], selector);
	};

	return Shape;
});
