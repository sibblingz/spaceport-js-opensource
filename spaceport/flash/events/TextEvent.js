define('flash/events/TextEvent', [
	'shared/defineReadOnly',
	'shared/default',
	'util/as3/eventBuilder'
], function(
	defineReadOnly,
	__default,
	eventBuilder
) {
	return eventBuilder('TextEvent', {
		args: ['text'],
		constructor: function TextEvent(type, bubbles, cancelable, text) {
			defineReadOnly(this, 'text', __default(text, ""));
		}
//		events: {
//			LINK: 'link',
//			TEXT_INPUT: 'textInput'
//		}
	});
});
