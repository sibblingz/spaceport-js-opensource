define('flash/display/InteractiveObject', [
	'proxy/create',
	'flash/display/DisplayObject'
], function(
	createProxyClass,
	DisplayObject
) {
	/** A graphical object which can receive user input.
	 *
	 * Dispatched events
	 * -----------------
	 *
	 *  * All events dispatchable by :class:`sp.DisplayObject`
	 *
	 *  * :attr:`sp.MouseEvent.CLICK`
	 *  * :attr:`sp.MouseEvent.MOUSE_DOWN`
	 *  * :attr:`sp.MouseEvent.MOUSE_UP`
	 *  * :attr:`sp.MouseEvent.MOUSE_MOVE`
	 *
	 *  * :attr:`sp.TouchEvent.TOUCH_BEGIN`
	 *  * :attr:`sp.TouchEvent.TOUCH_END`
	 *  * :attr:`sp.TouchEvent.TOUCH_MOVE`
	 */
	return createProxyClass('InteractiveObject', DisplayObject, {
		properties: {
			'mouseEnabled': true
		}
	});
});
