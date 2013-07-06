define('flash/events/TouchEvent', [
	'util/as3/eventBuilder',
	'shared/default',
	'util/numberDefault',
	'flash/geom/Point'
], function(
	eventBuilder,
	__default,
	__number_default,
	Point
) {
	/** An event representing a change in touch screen state.
	 *
	 * Touch events are dispatched on mobile devices when the user interacts
	 * with the screen.
	 *
	 * *Finger* here refers to any unit of touch input, e.g. a finger or a pen.
	 * These units of touch are treated identially in Spaceport.
	 */
	return eventBuilder('TouchEvent', {
		args: [
			/** The ID of the touch (e.g. a finger ID).
			 *
			 * Touch point ID's are not guaranteed to be sequential.
			 */
			'touchPointID',

			/** The X location of the touch input on the stage.
			 *
			 * For the X object of the interacted object, see
			 * :attr:`~sp.TouchEvent.localX`.  To translate a stage location to
			 * an specific object's location, see
			 * :func:`sp.DisplayObject.globalToLocal`.
			 *
			 * .. seealso:: :attr:`~sp.TouchEvent.stageY`
			 */
			'stageX',

			/** The Y location of the touch input on the stage.
			 *
			 * .. seealso:: :attr:`~sp.TouchEvent.stageX`
			 */
			'stageY'
		],
		constructor: function TouchEvent(type, bubbles, cancelable, touchPointID, stageX, stageY) {
			this.bubbles = __default(bubbles, true);
			this.touchPointID = touchPointID;
			this.stageX = __number_default(stageX, 0);
			this.stageY = __number_default(stageY, 0);
		},
		methods: {
			/** The X location of the touch input relative to the interacted object.
			 *
			 * This value is effectively the same as::
			 *
			 *    var p = new Point(event.stageX, event.stageY);
			 *    event.target.localToGlobal(p).x;
			 *
			 * .. seealso:: :attr:`~sp.TouchEvent.localY`
			 */
			get localX() {
				if(!this.target)
					return this.stageX;
					
				return this.target.globalToLocal(new Point(this.stageX, this.stageY)).x;
			},

			/** The Y location of the mouse input relative to the interacted object.
			 *
			 * .. seealso:: :attr:`~sp.TouchEvent.localX`
			 */
			get localY() {
				if(!this.target)
					return this.stageY;
					
				return this.target.globalToLocal(new Point(this.stageX, this.stageY)).y;
			},
		},
		events: {
			/** Occurs when the user begins touching the screen with a new finger. */
			TOUCH_BEGIN: 'touchBegin',

			/** Occurs when the user ends touching the screen with one finger. */
			TOUCH_END: 'touchEnd',

			/** Occurs when the user moves a finger on the touch screen. */
			TOUCH_MOVE: 'touchMove',

			TOUCH_TAP: 'touchTap'
		}
	});
});
