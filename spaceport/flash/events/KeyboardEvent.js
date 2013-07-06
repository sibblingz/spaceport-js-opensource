define('flash/events/KeyboardEvent', [
	'util/as3/eventBuilder',
	'shared/defineReadOnly',
	'shared/default',
	'util/numberDefault'
], function(
	eventBuilder,
	defineReadOnly,
	__default,
	numberDefault
) {
	return eventBuilder('KeyboardEvent', {
		args: ['charCode', 'keyCode', 'keyLocation', 'ctrlKey', 'altKey', 'shiftKey', 'controlKey', 'commandKey'],
		constructor: function KeyboardEvent(type, bubbles, cancelable, charCodeValue, keyCodeValue, keyLocationValue, ctrlKeyValue, altKeyValue, shiftKeyValue, controlKeyValue, commandKeyValue) {
			defineReadOnly(this, 'charCode',    numberDefault(charCodeValue,    0));
			defineReadOnly(this, 'keyCode',     numberDefault(keyCodeValue,     0));
			defineReadOnly(this, 'keyLocation', numberDefault(keyLocationValue, 0));

			defineReadOnly(this, 'ctrlKey',    __default(ctrlKeyValue,    false));
			defineReadOnly(this, 'altKey',     __default(altKeyValue,     false));
			defineReadOnly(this, 'shiftKey',   __default(shiftKeyValue,   false));
			defineReadOnly(this, 'commandKey', __default(commandKeyValue, false));
		},
		events: {
			KEY_DOWN: 'keyDown',
			KEY_UP: 'keyUp'
		}
	});
});
