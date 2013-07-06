define('shared/translateGetSet', [
	'shared/default',
	'shared/defineGetter',
	'shared/defineSetter',
	'shared/hasProperty',
	'shared/readOnlyThrower'
], function(
	__default,
	defineGetter,
	defineSetter,
	hasProperty,
	readOnlyThrower
) {
	/**
	 * Translate all object's functions to getters and setters if needed
	 * This function will also filter non-function values
	 */
	return function translateGetSet(methods) {
		methods = __default(methods, {});
		
		var result = {};
		for(var methodName in methods) {
			var method = methods[methodName];
			
			if(typeof method === 'function') {
				if(PROFILE)
					method = YAHOO.tool.Profiler.instrument(methodName, method);

				result[methodName] = method;
			} else {
				if(hasProperty(method, 'get') || hasProperty(method, 'set')) {
					if(method.get)
						defineGetter(result, methodName, method.get);
					defineSetter(result, methodName, method.set || readOnlyThrower(methodName));
				} else
					result[methodName] = method;
			}
		}
		
		return result;
	};
});
