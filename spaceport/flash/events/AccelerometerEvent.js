define('flash/events/AccelerometerEvent', [
	'util/as3/eventBuilder',
	'shared/defineReadOnly'
], function(
	eventBuilder,
	defineReadOnly
) {
	return eventBuilder('AccelerometerEvent', {
		args: ['accelerationX', 'accelerationY', 'accelerationZ'],
		constructor: function AccelerometerEvent(type, bubbles, cancelable, accelerationX, accelerationY, accelerationZ) {
			defineReadOnly(this, 'accelerationX', accelerationX);
			defineReadOnly(this, 'accelerationY', accelerationY);
			defineReadOnly(this, 'accelerationZ', accelerationZ);
		},
		events: {
			UPDATE: 'update',
			STATUS: 'status'
		}
	});
});
