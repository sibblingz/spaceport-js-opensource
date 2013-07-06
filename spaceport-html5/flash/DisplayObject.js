define('flash/DisplayObject', [
	'shared/internalError',
	'util/lightClass'
], function(
	internalError,
	lightClass
) {
	function displayListGetterSetter(name) {
		return {
			get: function() {
				return this.displayList[name];
			},
			set: function(value) {
				this.displayList[name] = value;
				this.displayList.effectiveTransformDirty = true;
			}
		};
	}

	var DisplayObject = lightClass({
		constructor: function DisplayObject() {
			this.displayList = null;
			this.parentObject = null;
			this.name = null;
			this.template = null;

			// this.maskToSlot is undefined or a number
		},
		'isEventTarget': true,
		'removeFromParent': function removeFromParent() {
			if(this.parentObject)
				this.parentObject.removeChild(this);
		},
		'activate': function activate() {
			// Override me
		},
		'destroy': function destroy(deep) {
			// Override me
		},
		'id': {
			get: function get_id() {
				return this._id;
			},
			set: function set_id(value) {
				this._id = value;
			}
		},
		'width': {
			set: function set_width(width) {
				// FIXME Inaccurate
				var oldWidth = this.displayList.getBoundingBox()[2];
				this.scaleX *= width / oldWidth;
			}
		},
		'height': {
			set: function set_height(height) {
				// FIXME Inaccurate
				var oldHeight = this.displayList.getBoundingBox()[3];
				this.scaleY *= height / oldHeight;
			}
		},
		'alpha': displayListGetterSetter('alpha'),
		'visible': displayListGetterSetter('visible'),
		'x': displayListGetterSetter('x'),
		'y': displayListGetterSetter('y'),
		'originX': displayListGetterSetter('originX'),
		'originY': displayListGetterSetter('originY'),
		'scaleX': displayListGetterSetter('scaleX'),
		'scaleY': displayListGetterSetter('scaleY'),
		'rotation': displayListGetterSetter('rotation'),
		'transform': displayListGetterSetter('transform'),
		'cloneInto': function cloneInto(object) {
			if(this === object)
				internalError(103);

			if(typeof this.maskToSlot !== 'undefined') {
				object.maskToSlot = this.maskToSlot;
			}

			object.name = this.name;
			object.template = this;
		},
		'clone': function clone() {
			internalError(123, "Abstract method called");
		},
		'hitTest': function hitTest(x, y) {
			if(!this.visible) {
				return null;
			}

			var bounds = this.displayList.getBoundingBox();

			if(x >= bounds[0] && x < bounds[0] + bounds[2] &&
			   y >= bounds[1] && y < bounds[1] + bounds[3]) {
			   return this;
			}

			return null;
		},
		'writeDescriptor': function writeDescriptor(object) {
			object.$ = 'DisplayObject';

			if(this.name)
				object.name = this.name;

			object.matrix = this.displayList.getEffectiveTransformMatrix().toArray();
		},
		'isTemplateShared': function isTemplateShared(other) {
			var thisTemplate = this;
			while(thisTemplate.template)
				thisTemplate = thisTemplate.template;

			var otherTemplate = other;
			while(otherTemplate.template)
				otherTemplate = otherTemplate.template;

			return thisTemplate === otherTemplate;
		}
	});

	return DisplayObject;
});
