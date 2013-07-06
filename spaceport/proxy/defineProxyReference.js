define('proxy/defineProxyReference', [
	'bridge/send',
	'shared/defineGetter'
], function(
	send,
	defineGetter
) {
	/**
	 * Defines a proxy reference on an instance of a proxy class
	 */
	return function defineProxyReference(instance, name, cls) {
		var value = new cls.shadow();

		defineGetter(instance, name, function() {
			return value;
		});

		send('get', instance, value, name);
	};
});
