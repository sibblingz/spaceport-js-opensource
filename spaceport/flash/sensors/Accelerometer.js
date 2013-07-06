define('flash/sensors/Accelerometer', [
	'proxy/create',
	'flash/events/EventDispatcher',
	'flash/events/AccelerometerEvent',
	'util/broadcast/addListener',
	'util/broadcast/removeListener'
], function(
	createProxyClass,
	EventDispatcher,
	AccelerometerEvent,
	addBroadcastListener,
	removeBroadcastListener
) {
	var accelerometerBroadcast = [
		AccelerometerEvent.UPDATE,
		AccelerometerEvent.STATUS
	];
	
	return createProxyClass('Accelerometer', EventDispatcher, {
		methods: {
			fake: {
				'addEventListener': function addEventListener(type, listener, useCapture, priority) {
					if(accelerometerBroadcast.indexOf(type) !== -1)
						addBroadcastListener(type, this);
						
						// super
					EventDispatcher.prototype.addEventListener.apply(this, arguments);
				},
				'removeEventListener': function removeEventListener(type, listener, useCapture) {
					if(accelerometerBroadcast.indexOf(type) !== -1)
						removeBroadcastListener(type, this);
						
						// super
					EventDispatcher.prototype.removeEventListener.apply(this, arguments);
				}
			}
		}
	});
});
