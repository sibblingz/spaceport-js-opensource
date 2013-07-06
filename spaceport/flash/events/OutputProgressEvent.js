define('flash/events/OutputProgressEvent', ['util/as3/eventBuilder', 'util/numberDefault'], function(eventBuilder, __number_default) {
	return eventBuilder('OutputProgressEvent', {
		args: ['bytesPending', 'bytesTotal'],
		constructor: function ProgressEvent(type, bubbles, cancelable, bytesPending, bytesTotal) {
			this.bytesPending = __number_default(bytesPending, 0);
			this.bytesTotal = __number_default(bytesTotal, 0);
		},
		events: {
			OUTPUT_PROGRESS: 'outputProgress',
		}
	});
});
