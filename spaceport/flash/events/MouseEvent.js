define('flash/events/MouseEvent', [
	'util/as3/eventBuilder',
	'shared/defineReadOnly',
	'shared/default',
	'util/numberDefault',
	'flash/geom/Point'
], function(
	eventBuilder,
	defineReadOnly,
	__default,
	__number_default,
	Point
) {
	/** An event representing a change in mouse state.
	 *
	 * Mouse events are not dispatched on mobile devices.  For touch input, see
	 * :class:`sp.TouchEvent`.
	 */
	return eventBuilder('MouseEvent', {
		args: [
			/** The X location of the mouse input on the stage.
			 *
			 * For the X object of the interacted object, see
			 * :attr:`~sp.MouseEvent.localX`.  To translate a stage location to
			 * an specific object's location, see
			 * :func:`sp.DisplayObject.globalToLocal`.
			 *
			 * .. seealso:: :attr:`~sp.MouseEvent.stageY`
			 */
			'stageX',

			/** The Y location of the mouse input on the stage.
			 *
			 * .. seealso:: :attr:`~sp.MouseEvent.stageX`
			 */
			'stageY'
		],
		constructor: function MouseEvent(type, bubbles, cancelable, stageX, stageY) {
			defineReadOnly(this, 'bubbles', __default(bubbles, true));
			defineReadOnly(this, 'stageX', __number_default(stageX, 0));
			defineReadOnly(this, 'stageY', __number_default(stageY, 0));
		},
		methods: {
			/** The X location of the mouse input relative to the interacted object.
			 *
			 * This value is effectively the same as::
			 *
			 *    var p = new Point(event.stageX, event.stageY);
			 *    event.target.localToGlobal(p).x;
			 *
			 * .. seealso:: :attr:`~sp.MouseEvent.localY`
			 */
			get localX() {
				if(!this.target)
					return this.stageX;
					
				return this.target.localToGlobal(new Point(this.stageX, this.stageY)).x;
			},

			/** The Y location of the mouse input relative to the interacted object.
			 *
			 * .. seealso:: :attr:`~sp.MouseEvent.localX`
			 */
			get localY() {
				if(!this.target)
					return this.stageY;
					
				return this.target.localToGlobal(new Point(this.stageX, this.stageY)).y;
			},
		},
		events: {
			/** Occurs when the user presses and releases a mouse button. */
			CLICK: 'click',

			/** Occurs when the user presses down on a mouse button.
			 *
			 * This event is fired only once per mouse press.
			 */
			MOUSE_DOWN: 'mouseDown',

			/** Occurs when the user moves the mouse pointer. */
			MOUSE_MOVE: 'mouseMove',

			/** Occurs when the releases a mouse button. */
			MOUSE_UP: 'mouseUp',

			MOUSE_OVER: 'mouseOver',
			MOUSE_OUT: 'mouseOut'
		}
	});
});
