define('util/proxy/shadowProperty', [
	'bridge/send'
], function(
	send
) {
	return function shadowProperty(instance, shadow, name) {
		if(typeof shadow === 'function' && typeof shadow.shadow === 'function')
			shadow = new shadow.shadow();
		
		send('get', instance, shadow, name);							
		
		return shadow;
	};
});
