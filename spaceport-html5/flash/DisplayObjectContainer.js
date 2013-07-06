define('flash/DisplayObjectContainer', [
	'flash/InteractiveObject',
	'display/DisplayListContainer',
	'dom/op',
	'shared/internalError',
	'util/lightClass'
], function(
	InteractiveObject,
	DisplayListContainer,
	domOp,
	internalError,
	lightClass
) {
	var DOM_INSERT = domOp.INSERT;
	var DOM_REMOVE = domOp.REMOVE;
	var DOM_REPLACE = domOp.REPLACE;
	var DOM_MOVE = domOp.MOVE;

	var DisplayObjectContainer = lightClass(InteractiveObject, {
		constructor: function DisplayObjectContainer() {
			this.displayList = new DisplayListContainer();
			this.mouseChildren = true;

			this.children = [];
		},
		'addChild': function addChild(child) {
			child.removeFromParent();
			child.parentObject = this;

			this.children.push(child);
			this.displayList.children.push(child.displayList);
			this.displayList.domEdits.push([DOM_INSERT, this.children.length - 1]);
		},
		'addChildAt': function addChildAt(child, index) {
			child.removeFromParent();
			child.parentObject = this;

			this.children.splice(index, 0, child);
			this.displayList.children.splice(index, 0, child.displayList);
			this.displayList.domEdits.push([DOM_INSERT, index]);
		},
		'removeChild': function removeChild(child) {
			var index = this.children.indexOf(child);
			this.removeChildAt(index);
		},
		'removeChildAt': function removeChildAt(index) {
			// removeFromParent calls this method

			var child = this.children[index];
			child.parentObject = null;

			this.children.splice(index, 1);
			this.displayList.children.splice(index, 1);
			this.displayList.domEdits.push([DOM_REMOVE, index]);
		},
		'swapChildren': function swapChildren(child1, child2) {
			this.swapChildrenAt(
				this.children.indexOf(child1),
				this.children.indexOf(child2)
			);
		},
		'swapChildrenAt': function swapChildrenAt(index1, index2) {
			// TODO Use DOM_MOVE
			var tmp;

			tmp = this.children[index1];
			this.children[index1] = this.children[index2];
			this.children[index2] = tmp;

			tmp = this.displayList.children[index1];
			this.displayList.children[index1] = this.displayList.children[index2];
			this.displayList.children[index2] = tmp;

			this.displayList.domEdits.push([DOM_REPLACE, index1]);
			this.displayList.domEdits.push([DOM_REPLACE, index2]);
		},
		'setChildIndex': function setChildIndex(child, index) {
			var oldIndex = this.children.indexOf(child);

			// Remove child from old location
			this.children.splice(oldIndex, 1);
			this.displayList.children.splice(oldIndex, 1);

			// Add child to new location
			this.children.splice(index, 0, child);
			this.displayList.children.splice(index, 0, child.displayList);

			this.displayList.domEdits.push([DOM_MOVE, oldIndex, index]);
		},
		'getChildByName': function getChildByName(name) {
			var children = this.children;

			for(var i=0; i<children.length; ++i) {
				if(children[i].name === name)
					return children[i];
			}

			internalError(102, "Could not get child by name '" + name + "'");
		},
		'getChildAt': function getChildAt(index) {
			return this.children[index];
		},
		'cloneInto': function cloneInto(object) {
			InteractiveObject.prototype.cloneInto.call(this, object);

			object.mouseChildren = this.mouseChildren;

			object.children = this.children.map(function(child) {
				return child.clone();
			});
		},
		'writeDescriptor': function writeDescriptor(object) {
			InteractiveObject.prototype.writeDescriptor.call(this, object);
			object.$ = 'DisplayObjectContainer';

			var childrenDescriptors = this.children.map(function(child) {
				var childDescriptor = {};
				child.writeDescriptor(childDescriptor);
				return childDescriptor;
			});

			if(childrenDescriptors.length)
				object.children = childrenDescriptors;
		},
		'hitTest': function hitTest(x, y) {
			if(!this.mouseChildren && !this.mouseEnabled) {
				return null;
			}

			var hit = InteractiveObject.prototype.hitTest.call(this, x, y);
			if(!hit) {
				// Bail out early if click outside of our bounds
				return null;
			}

			var transform = this.displayList.getEffectiveTransformMatrix().inverted();

			var children = this.children;
			var i = children.length;
			while(i --> 0) {
				var p = transform.transformPoint(x, y);
				var child = children[i];
				var childHit = child.hitTest(p[0], p[1]);
				if(childHit) {
					if(!child.isEventTarget) {
						if(this.mouseEnabled) {
							return this;
						} else {
							return null;
						}
					}

					if(this.mouseChildren) {
						return childHit;
					} else {
						return this;
					}
				}
			}

			return null;
		},
		'destroy': function destroy(deep) {
			InteractiveObject.prototype.destroy.call(this, deep);

			if(deep) {
				this.children.forEach(function(child) {
					child.destroy(true);
				});
			}
		}
	});

	return DisplayObjectContainer;
});
