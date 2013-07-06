define('flash/Accelerometer', [
	'bridge/send',
	'util/lightClass'
], function(
	send,
	lightClass
) {
	var Accelerometer = lightClass({
		constructor: function Accelerometer() {
			var self = this;

			window.addEventListener('devicemotion', function(event) {
				if(!event.accelerationIncludingGravity)
					return;

				var scalingFactor = 9.8;

				send(target, {
					$: 'AccelerometerEvent',
					type: 'update',
					cancelable: false,
					bubbles: false,
					accelerationX: event.accelerationIncludingGravity.x / scalingFactor,
					accelerationY: event.accelerationIncludingGravity.y / scalingFactor,
					accelerationZ: event.accelerationIncludingGravity.z / scalingFactor
				});
			}, false);
		}
	});

	return Accelerometer;
});
