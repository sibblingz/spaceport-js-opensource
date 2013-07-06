define('display/CanvasDisplayList', [
	'display/DisplayList',
	'util/lightClass'
], function(
	DisplayList,
	lightClass
) {
	var CanvasDisplayList = lightClass(DisplayList, {
		constructor: function CanvasDisplayList(source) {
			this.source = source || document.createElement('canvas');

			this.isDirty = true;
			this.element = null;
		},
		'buildNewElementImpl': function buildNewElementImpl() {
			var newCanvas = document.createElement('canvas');
			newCanvas.style.left = '0';
			newCanvas.style.top = '0';
			newCanvas.style.position = 'absolute';
			this.element = newCanvas;
			this.isDirty = true;
			return this.buildIntoElement(newCanvas);
		},
		'buildIntoElementImpl': function buildIntoElementImpl(el) {
			if (el.localName.toLowerCase() !== 'canvas') {
				return this.reject(el);
			}

			if (this.element !== el) {
				return this.reject(el);
			}

			if (this.isDirty) {
				el.width = this.source.width;
				el.height = this.source.height;
				el.getContext('2d').drawImage(this.source, 0, 0);
				this.isDirty = false;
			}

			return el;
		},
		'setDirty': function setDirty() {
			this.isDirty = true;
		},
		'getBoundingPoints': function getBoundingPoints() {
			var w = this.source.width;
			var h = this.source.height;
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

	return CanvasDisplayList;
});
