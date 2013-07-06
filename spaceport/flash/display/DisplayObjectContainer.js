define('flash/display/DisplayObjectContainer', [
	'proxy/create',
	'flash/display/InteractiveObject',
	'bridge/send',
	'flash/display/DisplayObject',
	'flash/geom/Rectangle',
	'flash/events/Event',
	'shared/defineReadOnly',
	'util/display/recurseDisplayObject',
	'util/oop/instanceof',
	'util/display/calcBounds',
	'util/display/invalidateBounds',
	'util/display/calcDisplayBounds',
	'util/display/getBounds'
], function(
	createProxyClass,
	InteractiveObject,
	send,
	DisplayObject,
	Rectangle,
	Event,
	defineReadOnly,
	recurseDisplayObject,
	__instanceof,
	helper_calcBounds,
	invalidateBounds,
	helper_calcDisplayBounds,
	helper_getBounds
) {
	function helper_addChildAt(displayObject, child, index) {
		if(!__instanceof(child, DisplayObject))
			throw new Error('Invalid argument, child must be a DisplayObject');
		if(index < 0 || index > displayObject.numChildren)
			throw new Error('Invalid range, The supplied index is out of bounds');
		
		var parent = displayObject;
		while(parent = parent.parent) {
			if(parent === child)
				throw new Error("An object cannot be added as a child to one of it's children (or children's children, etc.).");
		}
		
			// Remove child from old parent
		if(child.parent) {
			helper_removeChildAt(child.parent, child.parent.getChildIndex(child));
		}
		
		child.parent = displayObject;
		
		if(!displayObject.children)
			displayObject.children = [];
		
			// Add to children list
		displayObject.children.splice(index, 0, child);
		
			// Invalidate size
		invalidateBounds(displayObject);
		
			// This one bubbles, takes care of itself
		child.dispatchEvent(new Event(Event.ADDED, true));

			// If there's a stage, dispatch ADDED_TO_STAGE recursively
		if(child.stage) {
			var event = new Event(Event.ADDED_TO_STAGE);
			
			recurseDisplayObject(child, function(grandchild) {
				grandchild.dispatchEvent(event);
			});
		}
		
		return child;
	}

	function helper_removeChildAt(displayObject, index) {
		if(index < 0 || index >= displayObject.numChildren)
			throw new Error('Invalid range, The supplied index is out of bounds.');
		
		var child = displayObject.children[index];
		
			// Recalculate size
		invalidateBounds(child);
		
		child.dispatchEvent(new Event(Event.REMOVED, true));

			// If there's a stage, dispatch REMOVED_FROM_STAGE recursively
		if(child.stage) {
			var event = new Event(Event.REMOVED_FROM_STAGE);
			
			function recursiveDispatch(instance) {
				instance.dispatchEvent(event);
				
				if(__instanceof(instance, DisplayObjectContainer)) {
					for(var i=0; i<instance.numChildren; ++i)
						recursiveDispatch(instance.children[i]);
				}
			}
			
			recursiveDispatch(child);
		}
		
		delete child.parent;
		
		displayObject.children.splice(index, 1);
		
		if(!displayObject.numChildren)
			delete displayObject.children;
		
		return child;
	}

	/** A container of DisplayObject instances.
	 *
	 * Dispatched events
	 * -----------------
	 *
	 *  * All events dispatchable by :class:`sp.InteractiveObject`
	 *  * Events bubbling from children DisplayObjects
	 */
	var DisplayObjectContainer = createProxyClass('DisplayObjectContainer', InteractiveObject, {
		properties: {
			'mouseChildren': true
		},
		patch: function patch(target, patch, mutator) {
			if(!patch.children)
				return;
			
			patch.children.forEach(function(childPatch, childIndex) {
				if(!target.children)
					target.children = [];

					// FIXME Should a child be patched or build
					// (as below), or always built?
				var child = mutator.patch(target.children[childIndex], childPatch);

				target.children[childIndex] = child;

				if(child.name) {
					target[child.name] = child;

					send('execute', target, child, 'getChildAt', childIndex);
				}

				child.parent = target;
			});
		},
		methods: {
			real: {
				'addChild': function addChild(child) {
					if(child === this)
						throw new Error('Invalid argument, An object cannot be added as a child of itself.');

					return helper_addChildAt(this, child, this.numChildren);
				},
				'addChildAt': function addChildAt(child, index) {
					return helper_addChildAt(this, child, index);
				},
				'removeChild': function removeChild(child) {
					if(!__instanceof(child, DisplayObject))
						throw new Error('Invalid argument, child must be a DisplayObject');
					
					try {
						return helper_removeChildAt(this, this.getChildIndex(child));
					} catch(e) {
						throw new Error('Invalid argument, The supplied DisplayObject must be a child of the caller.');
					}
				},
				'removeChildAt': function removeChildAt(index) {
					return helper_removeChildAt(this, index);
				},
				'swapChildren': function swapChildren(child1, child2) {
					if(!__instanceof(child1, DisplayObject) || !__instanceof(child2, DisplayObject))
						throw new Error('Invalid argument, child must be a DisplayObject');
					
					try {
						var index1 = this.getChildIndex(child1);
						var index2 = this.getChildIndex(child2);
						
						var temp = this.children[index2];
						this.children[index2] = this.children[index1];
						this.children[index1] = temp;
					} catch(e) {
						throw new Error('The supplied DisplayObject must be a child of the caller.');
					}
				},
				'swapChildrenAt': function swapChildrenAt(index1, index2) {
					if(index1 < 0 || index1 >= this.numChildren ||
					   index2 < 0 || index2 >= this.numChildren)
						throw new Error('Invalid range, The supplied index is out of bounds.');
				
					var temp = this.children[index2];
					this.children[index2] = this.children[index1];
					this.children[index1] = temp;
				},
				'setChildIndex': function setChildIndex(child, index) {
					if(index === -1)
						throw new Error('Invalid range, The supplied index is out of bounds.');
					if(!__instanceof(child, DisplayObject))
						throw new Error('Invalid argument, child must be a DisplayObject');
					if(index < 0 || index >= this.numChildren)
						throw new Error('Invalid range,The supplied index is out of bounds.');
					
					try {
						this.children.splice(this.getChildIndex(child), 1);
						this.children.splice(index, 0, child);
					} catch(e) {
						throw new Error('Invalid argument, The supplied DisplayObject must be a child of the caller.');
					}
				}
			},
			fake: {
				'contains': function contains(child) {
					if(!__instanceof(child, DisplayObject))
						throw new Error('Invalid argument, child must be a DisplayObject');
					
					if(!this.children)
						return false;
					
					return this.children.some(function(item, index, array) {
						var result = false;
						
						if(__instanceof(item, DisplayObjectContainer) && item.children)
							result = item.contains(child);
						
						return result || array.indexOf(child) !== -1;
					});
				},
				'getChildAt': function getChildAt(index) {
					var children = this.children;
					if(!children)
						throw new Error('Invalid range, The supplied index is out of bounds.');

					if(index < 0 || index >= children.length)
						throw new Error('Invalid range, The supplied index is out of bounds.');
					
					return children[index];
				},
				'getChildByName': function getChildByName(name) {
					for(var index=0; index<this.numChildren; ++index) {
						if(this.children[index].name === name)
							return this.children[index];
					}
					
					return null;
				},
				'getChildIndex': function getChildIndex(child) {
					if(!__instanceof(child, DisplayObject))
						throw new Error('Invalid argument, child must be a DisplayObject');
					
					var index = this.children ? this.children.indexOf(child) : -1;
					if(index === -1)
						throw new Error('Invalid argument, The supplied DisplayObject must be a child of the caller.');
					
					return index;
				},
				'getObjectsUnderPoint': function getObjectsUnderPoint(point) {
					if(!this.children)
						return [];

					var results = [];
					var stage = this.stage || this;
					for(var i=0; i<this.children.length; ++i) {
						var child = this.children[i];
						
						if(!child.children && child.getBounds(stage).containsPoint(point))
							results.push(child);

						if(__instanceof(child, DisplayObjectContainer))
							results.push.apply(results, child.getObjectsUnderPoint(point));
					}
					
					return results;
				},
				'numChildren': {
					get: function() {
						if(!this.children)
							return 0;
						
						return this.children.length;
					}
				},
				'getBounds': function getBounds(targetCoordinateSpace) {
					if(!this.numChildren)
						return new Rectangle();

						// First child's bounds
					var childBounds = helper_calcDisplayBounds(this.children[0]);

					var left   = childBounds.left;
					var right  = childBounds.right;
					var top    = childBounds.top;
					var bottom = childBounds.bottom;

						// Remaining children are unioned in
					for(var i=1; i<this.children.length; ++i) {
						var child = this.children[i];
						childBounds = helper_calcDisplayBounds(child);

						left   = Math.min(left, childBounds.left);
						right  = Math.max(right, childBounds.right);
						top    = Math.min(top, childBounds.top);
						bottom = Math.max(bottom, childBounds.bottom);
					}

					return helper_getBounds(new Rectangle(left, top, right - left, bottom - top), this, targetCoordinateSpace);
				},
				/** Destroys an object (possibly recursively), reclaiming native OS resources.
				 *
				 * :param deep:
				 *    If true, recursively calls
				 *    :func:`~sp.DisplayObject.destroy(true)` on ``children``.
				 *
				 * .. seealso:: :func:`sp.DisplayObject.destroy()`
				 */
				'destroy': function destroy(deep) {
					if(this.children) {
						// removeChild[At] should NOT be called; native should
						// NOT receive these messages

						this.children.forEach(function(child) {
							child.parent = null;
						}, this);
					}

					InteractiveObject.prototype.destroy.call(this, deep);

					if(this.children) {
						if(deep) {
							this.children.forEach(function(child) {
								child.destroy(deep);
							});
						}
					
						delete this.children;
					}
				}
			}
		}
	});
	
	return DisplayObjectContainer;
});
