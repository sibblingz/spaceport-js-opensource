define('bridge/sendStatic', [
	'bridge/send',
	'util/builtin/slice',
	'proxy/staticGlobal'
], function(
	send,
	slice,
	staticGlobal
) {
	return function staticSend(name/*, args...*/) {
		send.apply(null, ['execute', staticGlobal, null, name].concat(slice.call(arguments, 1)));
	};
});
