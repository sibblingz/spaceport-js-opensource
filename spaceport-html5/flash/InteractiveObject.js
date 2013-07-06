define('flash/InteractiveObject', [
	'flash/DisplayObject',
	'util/lightClass'
], function(
	DisplayObject,
	lightClass
) {
	var InteractiveObject = lightClass(DisplayObject, {
		constructor: function InteractiveObject() {
			this.mouseEnabled = true;
		},
		'mouseEffectivelyEnabled': {
			get: function get_mouseEffectivelyEnabled() {
				if(!this.mouseEnabled)
					return false;

				var parent = this.parentObject;
				while(parent) {
					if(parent instanceof InteractiveObject) {
						if(!parent.mouseEnabled)
							return false;
					}

					// XXX THIS WILL NOT COMPILE
					if(parent instanceof DisplayObjectContainer) {
						if(!parent.mouseChildren)
							return false;
					}

					parent = parent.parentObject;
				}

				return true;
			}
		},
		'cloneInto': function cloneInto(object) {
			DisplayObject.prototype.cloneInto.call(this, object);

			object.mouseEnabled = this.mouseEnabled;
		}
	});

	return InteractiveObject;
});
