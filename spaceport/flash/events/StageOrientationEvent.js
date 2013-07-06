define('flash/events/StageOrientationEvent', [
	'shared/defineReadOnly',
	'shared/default',
	'util/as3/eventBuilder'
], function(
	defineReadOnly,
	__default,
	eventBuilder
) {
	return eventBuilder('StageOrientationEvent', {
		args: ['beforeOrientation', 'afterOrientation'],
		constructor: function StageOrientationEvent(type, bubbles, cancelable, beforeOrientation, afterOrientation) {
			defineReadOnly(this, 'beforeOrientation', __default(beforeOrientation, null));
			defineReadOnly(this, 'afterOrientation', __default(afterOrientation, null));
		},
		events: {
			ORIENTATION_CHANGE: 'orientationChange',
			ORIENTATION_CHANGING: 'orientationChanging'
		}
	});
});
