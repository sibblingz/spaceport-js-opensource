define('proxy/defineProxyLazyReference', [
	'spid',
	'bridge/send',
	'shared/defineGetter',
	'shared/defineReadOnly',
	'proxy/createdLazies',
], function(
	SPID,
	send,
	defineGetter,
	defineReadOnly,
	createdLazies
) {
	/**
	 * Defines a lazy proxy reference on an instance of a proxy class
	 * A lazy proxy reference differs a normal proxy reference by not being immediately
	 * requested, 
	 */
	return function defineProxyLazyReference(instance, name, cls) {
		var id = instance[SPID];
		if(!createdLazies[id])
			createdLazies[id] = {};
		
		// Not created yet, but exists
		createdLazies[id][name] = false;
		
		// First time property is accessed, create it and patch it over the old getter
		defineGetter(instance, name, function() {
			var value = new cls.shadow();
			
			// Redefine getter
			defineReadOnly(instance, name, value);
			send('get', instance, value, name);
			
			// Created
			createdLazies[id][name] = true;
			
			return value;
		});
	};
});

