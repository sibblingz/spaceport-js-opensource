define('flash/events/IOErrorEvent', [
	'util/as3/eventBuilder',
	'flash/events/ErrorEvent'
], function(
	eventBuilder,
	ErrorEvent
) {
	return eventBuilder('IOErrorEvent', ErrorEvent, {
		events: {
			IO_ERROR: 'ioError'
		}
	});
});
