define('proxy/defineProxyMethod', [
	'bridge/unsend',
	'bridge/send',
	'util/builtin/slice',
	'util/builtin/isArray',
	'util/coerceArguments',
	'shared/defineReadOnly',
	'shared/lookupGetter',
	'shared/lookupSetter'
], function(
	unsend,
	send,
	slice,
	isArray,
	coerceArguments,
	defineReadOnly,
	lookupGetter,
	lookupSetter
) {
	/**
	 * Defines a proxy method on an instance of a proxy class
	 */
	return function defineProxyMethod(instance, name, method, serializeArgument) {
		function proxyMethod() {
				// Apply coersion if array was given
			var args = isArray(method) ? coerceArguments(arguments, method) : slice.call(arguments);
			if(typeof serializeArgument === 'function') {
				args = args.map(serializeArgument);
			}
			
			// The buffer *must* be updated before the method is called.
			var command = send.apply(null, ['execute', this, null, name].concat(args));
			
				// Intentionally left undefined
			var returnValue;
			if(typeof method == 'function') {
				var exceptionThrown = true;

				try {
					returnValue = method.apply(this, arguments);
					exceptionThrown = false;
				} finally {
					if(exceptionThrown) {
						unsend(command);
					}
				}
			}
			
			return returnValue;
		}

		if(DEBUG) {
			// For Spaceport reflection (spaceport-metadata)
			proxyMethod.wrapped = method;
		}

		instance[name] = proxyMethod;

		if(PROFILE)
			YAHOO.tool.Profiler.registerFunction(name, instance);
	};
});
