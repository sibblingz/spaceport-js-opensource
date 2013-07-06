define('flash/display/DisplayObject', [
	'proxy/create',
	'flash/events/EventDispatcher',
	'flash/geom/Matrix',
	'flash/geom/Transform',
	'flash/geom/ColorTransform',
	'flash/events/Event',
	'flash/events/EventPhase',
	'flash/geom/Rectangle',
	'flash/display/BlendMode',
	'util/oop/cast',
	'util/broadcast/addListener',
	'util/broadcast/removeListener',
	'shared/defineReadOnly',
	'util/display/displaySize',
	'util/display/displayBounds',
	'util/display/displayMatrices',
	'util/display/displayColorTransform',
	'util/display/assignMatrix',
	'util/display/concatenatedMatrix',
	'util/display/calcDisplayBounds',
	'util/display/invalidateBounds',
	'util/display/getBounds',
	'flash/filters/BitmapFilter',
	'util/oop/className',
	'bridge/silence',
	'util/broadcast/destroyListeners',
	'util/as3/dispatchEvent',
	'spid',
	'shared/internalError',
	'shared/objectKeys',
	'util/builtin/isArray',
	'util/coerceArguments'
], function(
	createProxyClass,
	EventDispatcher,
	Matrix,
	Transform,
	ColorTransform,
	Event,
	EventPhase,
	Rectangle,
	BlendMode,
	__cast,
	addBroadcastListener,
	removeBroadcastListener,
	defineReadOnly,
	displaySize,
	displayBounds,
	displayMatrixes,
	displayColorTransforms,
	assignMatrix,
	concatenatedMatrix,
	helper_calcDisplayBounds,
	invalidateBounds,
	helper_getBounds,
	BitmapFilter,
	__class_name,
	silence,
	destroyListeners,
	__dispatchEvent,
	SPID,
	internalError,
	objectKeys,
	isArray,
	coerceArguments
) {
	var displayMasks = {};
	var displayFilters = {};
	var displayObjectBroadcast = [
		Event.RESIZE,
		Event.ENTER_FRAME,
		Event.EXIT_FRAME,
		Event.FRAME_CONSTRUCTED,
		Event.RENDER,
		Event.RESIZE
	];
	
	function normalizePosition(value) {
		return value.toFixed(2);
	}
	
	function fromParent(instance, property) {
		if(!instance.parent)
			return null;
		
		return instance.parent[property];
	}
	
	function dispatchPhase(event, path, phase) {
		var phasePath = [].concat(path);
		
			// Event control flow - stop propagation
		var eventControlFlow = true;
		event.stopPropagation = function stopPropagation() {
			eventControlFlow = false;
		};
		
			// Event phase
		event.eventPhase = phase;
		
		while(phasePath.length && eventControlFlow)
			__dispatchEvent(phasePath.shift(), event, phase);
		
		return eventControlFlow;
	}

	var VALID_BLEND_MODES = [
		BlendMode.ADD,
		BlendMode.ALPHA,
		BlendMode.DARKEN,
		BlendMode.DIFFERENCE,
		BlendMode.ERASE,
		BlendMode.HARDLIGHT,
		BlendMode.INVERT,
		BlendMode.LAYER,
		BlendMode.LIGHTEN,
		BlendMode.MULTIPLY,
		BlendMode.NORMAL,
		BlendMode.OVERLAY,
		BlendMode.SCREEN,
		BlendMode.SHADER,
		BlendMode.SUBTRACT
	];

	/** A representation of a graphic.
	 *
	 * This is an abstract class.  The following are the concrete DisplayObject
	 * classes:
	 *
	 *  * :class:`sp.MovieClip`, for animating vector graphics
	 *  * :class:`sp.Bitmap`, for bitmap graphics
	 *  * :class:`sp.Sprite`, for containers of other DisplayObjects
	 *
	 * Dispatched events
	 * -----------------
	 *
	 *  * :attr:`sp.Event.ENTER_FRAME` (broadcast) when the global playhead
	 *    enters a new frame.
	 *
	 *  * :attr:`sp.Event.ADDED` when the DisplayObject is added to a containing
	 *    :class:`~sp.DisplayObjectContainer`.
	 *
	 *  * :attr:`sp.Event.ADDED_TO_STAGE` when the DisplayObject or a containing
	 *    :class:`~sp.DisplayObjectContainer` is added directly to the stage or
	 *    to a containing :class:`~sp.DisplayObjectContainer` which is already
	 *    on the stage;
	 *
	 *  * :attr:`sp.Event.REMOVED` when the DisplayObject is removed from a
	 *    containing :class:`~sp.DisplayObjectContainer`.
	 *
	 *  * :attr:`sp.Event.REMOVED_FROM_STAGE` when the DisplayObject or a containing
	 *    :class:`~sp.DisplayObjectContainer` is removed from the stage.
	 */
	var DisplayObject = createProxyClass('DisplayObject', EventDispatcher, {
		constructor: function DisplayObject() {
			var id = this[SPID];
			
			displayMatrixes[id] = new Matrix();
			displayColorTransforms[id] = new ColorTransform();
		},
		properties: {
			'name': '',
			
			/** Indicates the alpha transparency value of the object specified.
			  */
			'alpha': {
				get: function get_alpha() {
					return displayColorTransforms[this[SPID]].alphaMultiplier;
				},
				set: function set_alpha(value) {
					displayColorTransforms[this[SPID]].alphaMultiplier = value;
				}
			},
			
			/** Whether or not the DisplayObject is visible on-screen.
			 *
			 * If a DisplayObject is not visible, it will not receive input
			 * events (such as :attr:`~sp.MouseEvent.MOUSE_DOWN`).
			 */
			'visible': true,

			/** Whether or not to cache the DisplayObject as a bitmap.
			 *
			 * This property can be used to affect the performance
			 * characteristics of display objects.
			 *
			 * .. warning::
			 *
			 *    You should **not** set ``cacheAsBitmap`` to ``true`` on
			 *    objects which change graphically (such as animating
			 *    MovieClips).  Doing so may have significant performance
			 *    penalties.
			 */
			'cacheAsBitmap': false,
			
			/**
			 * The calling display object is masked by the specified mask object.
			 */
			'mask': {
				value: null,
				set: function(mask) {
					if(mask == null)
						return null;
					
					mask = __cast(mask, DisplayObject);
					
					var maskId = mask[SPID];
					if(displayMasks[maskId])
						displayMasks[maskId].mask = null;
					
					displayMasks[maskId] = this;
					
					return mask;
				}
			},
			
			/**
			 * A value from the `~sp.BlendMode` class that specifies which blend mode to use.
			 */
			'blendMode': {
				value: BlendMode.NORMAL,
				normalize: function(value) {
					if(VALID_BLEND_MODES.indexOf(value) < 0) {
						throw new Error("Parameter blendMode must be one of the accepted values.");
					}

					return value;
				}
			},
			
			/**
			 * An indexed array that contains each filter object currently
			 * associated with the display object. 
			 */
			'filters': {
				get: function() {
					var filters = displayFilters[this[SPID]];
					if(!filters)
						return [];
					
					return filters.map(function(filter) {
						return filter.clone();
					});
				},
				set: function(value) {
					if(!isArray(value))
						__cast(value, Array);
					
					displayFilters[this[SPID]] = value.map(function(filter) {
						return __cast(filter, BitmapFilter).clone();
					});
				}
			},

			/** The X position relative to its parent.
			 */
			'x': {
				normalize: normalizePosition,
				get: function() {
					return displayMatrixes[this[SPID]].tx;
				},
				set: function(value) {
					value = Number(value);
					var matrix = displayMatrixes[this[SPID]];
					
					var oldValue = matrix.tx;
					matrix.tx = value;

					invalidateBounds(this);

					return oldValue !== value;
				}
			},

			/** The Y position relative to its parent.
			 */
			'y': {
				normalize: normalizePosition,
				get: function() {
					return displayMatrixes[this[SPID]].ty;
				},
				set: function(value) {
					value = Number(value);
					var matrix = displayMatrixes[this[SPID]];
					
					var oldValue = matrix.ty;
					matrix.ty = value;
					
					invalidateBounds(this);
					
					return oldValue !== value;
				}
			},

			/** The object's scale in the X direction.
			 *
			 * This value is a multiplier, defaulting to 1.  A value of 2 will
			 * make the DisplayObject have twice its original width.
			 *
			 * Scaling is applied after rotation but before translation.
			 *
			 * .. seealso:: :attr:`~sp.DisplayObject.scaleY`
			 */
			'scaleX': {
				value: 1,
				set: function(value) {
					value = Number(value);
					
					var matrix = displayMatrixes[this[SPID]];
					
					var length = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
					
					matrix.a = (matrix.a / length) * value;
					matrix.b = (matrix.b / length) * value;
					
					invalidateBounds(this);
					
					return value;
				}
			},

			/** The object's scale in the Y direction.
			 *
			 * This value is a multiplier, defaulting to 1.  A value of 2 will
			 * make the DisplayObject have twice its original height.
			 *
			 * Scaling is applied after rotation but before translation.
			 *
			 * .. seealso:: :attr:`~sp.DisplayObject.scaleX`
			 */
			'scaleY': {
				value: 1,
				set: function(value) {
					value = Number(value);
					
					var matrix = displayMatrixes[this[SPID]];
					
					var length = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
					
					matrix.c = (matrix.c / length) * value;
					matrix.d = (matrix.d / length) * value;
					
					invalidateBounds(this);
					
					return value;
				}
			},

			/** The object's rotation in degrees.
			 *
			 * An object is rotated around its *registration point*, not its
			 * parent's registration point.
			 *
			 * Rotation is applied before translation and scaling.
			 */
			'rotation': {
				value: 0,
				set: function(value) {
					value = Number(value);
					if(value > 0 && (value + 180) % 360 === 0)
						value = 180;
					else
						value = value - (360 * Math.floor((value + 180) / 360));
					
					var scaleX = this.scaleX;
					var scaleY = this.scaleY;
					
					var rads = value * (Math.PI / 180);
					var cos = Math.cos(rads);
					var sin = Math.sin(rads);
					
					var matrix = displayMatrixes[this[SPID]];
			
					matrix.a =  cos * scaleX;
					matrix.b =  sin * scaleX;
					matrix.c = -sin * scaleY;
					matrix.d =  cos * scaleY;
					
					invalidateBounds(this);

					return value;
				}
			},
			'transform': {
				get: function() {
					return new Transform(this);
				},
				set: function(value) {
					assignMatrix(this, value.matrix);
					displayColorTransforms[this[SPID]] = value.colorTransform;
					
					invalidateBounds(this);
				}
			}
		},
		patch: function patch(target, patch, mutator) {
			mutator.patchObjectProperties(target, patch, ['name']);

			if(patch.bounds)
				displaySize[target[SPID]] = patch.bounds;

			var matrix = patch.matrix;
			if(matrix)
				assignMatrix(target, new Matrix(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]));
			
			var ct = patch.colorTransform;
			if(ct) {
				displayColorTransforms[target[SPID]] = new ColorTransform(
					ct[0], ct[1], ct[2], ct[3],	// Mul
					ct[4], ct[5], ct[6], ct[7]	// Add
				);
			}
			
			if(patch.filters) {
				target.filters = patch.filters.map(function(filter) {
					return mutator.patch(null, filter);
				});
			}
		},
		methods: {
			fake: {
				'width': {
					get: function() {
						return helper_calcDisplayBounds(this).width;
					},
					set: function(value) {
						value = Number(value);
						
						var origWidth = this.width;
						var origHeight = this.height;
						
						silence(function() {
							this.scaleX = 1;
							this.scaleY = 1;
						}, this);
						
						var protoWidth = this.width;
						var protoHeight = this.height;
						
						this.scaleX = value / protoWidth;
						this.scaleY = origHeight / protoHeight;
						
						invalidateBounds(this);
					}
				},
				'height': {
					get: function() {
						return helper_calcDisplayBounds(this).height;
					},
					set: function(value) {
						value = Number(value);
						
						var origWidth = this.width;
						var origHeight = this.height;
						
						silence(function() {
							this.scaleX = 1;
							this.scaleY = 1;
						}, this);
						
						var protoWidth = this.width;
						var protoHeight = this.height;
						
						this.scaleX = origWidth / protoWidth;
						this.scaleY = value / protoHeight;
						
						invalidateBounds(this);
					}
				},
				'addEventListener': function addEventListener(type, listener, useCapture, priority) {
					if(displayObjectBroadcast.indexOf(type) !== -1)
						addBroadcastListener(type, this);
						
					// super
					EventDispatcher.prototype.addEventListener.apply(this, arguments);
				},
				'removeEventListener': function removeEventListener(type, listener, useCapture) {
					if(displayObjectBroadcast.indexOf(type) !== -1)
						removeBroadcastListener(type, this);
						
					// super
					EventDispatcher.prototype.removeEventListener.apply(this, arguments);
				},
				'dispatchEvent': function dispatchEvent(event) {
					// Make sure we're dispatching an Event baseclass
					event = __cast(event, Event);
					
					// No need to dispatch if noting listens
					if(!this.willTrigger(event.type))
							return true;
					
					// Target is always 'this'
					event.target = this;
					
					if(event.bubbles) {
						// Get path from this -> stage
						var path = [];
						
						var parent = this;
						while(parent = parent.parent)
							path.push(parent);
						
						// Event control flow - stop propagation
						var eventControlFlow = true;
						event.stopPropagation = function stopPropagation() {
							eventControlFlow = false;
						};
						
						// XXX: How can this look better!?
						return eventControlFlow &&
							dispatchPhase(event, path.concat().reverse(), EventPhase.CAPTURING_PHASE) &&
							dispatchPhase(event, this, EventPhase.AT_TARGET) &&
							dispatchPhase(event, path, EventPhase.BUBBLING_PHASE);
					} else {
						// Just do the AT_TARGET phase
						return __dispatchEvent(this, event, EventPhase.AT_TARGET);
					}
				},
				
				'root': {
					get: function() {
						return fromParent(this, 'root');
					}
				},

				/** The stage this object is a part of.
				 *
				 * This value is ``null`` if the object is not on a stage.
				 *
				 * In Spaceport, there is only one stage
				 */
				'stage': {
					get: function() {
						return fromParent(this, 'stage');
					}
				},

				/** The object's parent :class:`~sp.DisplayObjectContainer`.
				 */
				'parent': null,

				/** The :class:`sp.LoaderInfo` from which this DisplayObject was loaded.
				 *
				 * This value is ``null`` if the DisplayObject was not loaded
				 * using a :class:`~sp.Loader`.
				 */
				'loaderInfo': {
					get: function() {
						return fromParent(this, 'loaderInfo');
					}
				},

				/** Gets the bounding box of this object relative to its parent.
				 */
				'getBounds': function getBounds(targetCoordinateSpace) {
					coerceArguments(arguments, [DisplayObject]);

					if(DEBUG) {
						if(!displaySize[this[SPID]]) {
							internalError(1001, __class_name(this) + " [id=" + this[SPID] + "] is missing bounds");
						}
					}

					if(CUSTOMER_DEBUG) {
						if(!displaySize[this[SPID]]) {
							internalError(1001, __class_name(this) + " is missing bounds");
						}
					}
					
					var bounds = displaySize[this[SPID]];
					return helper_getBounds(new Rectangle(bounds[0], bounds[1], bounds[2], bounds[3]), this, targetCoordinateSpace);
				},
/*				'getRect': function getRect(targetCoordinateSpace) {
					// TODO
				},
*/				'globalToLocal': function globalToLocal(point) {
					var matrix = concatenatedMatrix(this);
					matrix.invert();

					return matrix.transformPoint(point);
				},
				'hitTestObject': function hitTestObject(obj) {
					var stage = this.stage || this;
					return this.getBounds(stage).intersects(obj.getBounds(stage));
				},
/*				'hitTestPoint': function hitTestPoint(x, y, shapeFlag) {
					// TODO
				},
*/				'localToGlobal': function localToGlobal(point) {
					return concatenatedMatrix(this).transformPoint(point);
				},

				/** Destroys an object, reclaiming native OS resources.
				 *
				 * .. warning::
				 *
				 *    ``destroy`` does **not** remove this DisplayObject from
				 *    the display heirarchy.  You **must** remove the
				 *    DisplayObject yourself.  (If
				 *    :func:`~sp.DisplayObjectContainer.destroy(true)` is called
				 *    on a containing DisplayObjectContainer, however, the
				 *    parent will be destroyed automatically.)
				 *
				 * ``destroy`` removes all event listeners associated with this
				 * object.
				 *
				 * .. seealso:: :ref:`destroy`
				 */
				'destroy': function destroy(deep) {
					if(this.mask) {
						if(deep)
							this.mask.destroy();
						
						delete displayMasks[this.mask[SPID]];
					}
				
					delete this.parent;
					
					var id = this[SPID];
					destroyListeners(this);

					delete displaySize[id];
					delete displayMasks[id];
					delete displayBounds[id];
					delete displayFilters[id];
					delete displayMatrixes[id];
					delete displayColorTransforms[id];

					EventDispatcher.prototype.destroy.call(this, deep);
				}
			}
		}
	});

	return DisplayObject;
});
