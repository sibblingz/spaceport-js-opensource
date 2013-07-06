define('flash/events/ErrorEvent', [
	'shared/defineReadOnly',
	'shared/default',
	'util/as3/eventBuilder',
	'flash/events/TextEvent'
], function(
	defineReadOnly,
	__default,
	eventBuilder,
	TextEvent
) {
	return eventBuilder('ErrorEvent', TextEvent, {
		args: ['errorID'],
		constructor: function ErrorEvent(type, bubbles, cancelable, text, id) {
			defineReadOnly(this, 'errorID', __default(id, ""));
		},
		events: {
			ERROR: 'error'
		}
	});
});
