define('util/proxy/shadowResult', [
	'bridge/send',
	'util/builtin/slice'
], function(
	send,
	slice
) {
	return function shadowResult(instance, shadow, methodName, args) {
		if(typeof shadow === 'function' && typeof shadow.shadow === 'function')
			shadow = new shadow.shadow();
		
		send.apply(null, ['execute', instance, shadow, methodName].concat(slice.call(args || [])));
		
		return shadow;
	};
});
