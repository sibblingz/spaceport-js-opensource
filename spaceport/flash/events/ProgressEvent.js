define('flash/events/ProgressEvent', [
	'util/as3/eventBuilder',
	'util/numberDefault'
], function(
	eventBuilder,
	__number_default
) {
	return eventBuilder('ProgressEvent', {
		args: ['bytesLoaded', 'bytesTotal'],
		constructor: function ProgressEvent(type, bubbles, cancelable, bytesLoaded, bytesTotal) {
			this.bytesLoaded = __number_default(bytesLoaded, 0);
			this.bytesTotal = __number_default(bytesTotal, 0);
		},
		events: {
			PROGRESS: 'progress',
			SOCKET_DATA: 'socketData'
		}
	});
});
