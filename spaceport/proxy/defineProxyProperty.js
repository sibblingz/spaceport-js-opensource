define('proxy/defineProxyProperty', [
	'bridge/send',
	'bridge/silence',
	'proxy/instanceProperties',
	'util/translateArgument',
	'shared/defineGetter',
	'shared/defineSetter',
	'spid',
	'shared/readOnlyThrower'
], function(
	send,
	silence,
	proxyInstanceProperties,
	translateArgument,
	defineGetter,
	defineSetter,
	SPID,
	readOnlyThrower
) {
	/**
	 * Returns a function which applies a proxy property onto an
	 * instance of a proxy class
	 */
	return function defineProxyProperty(prototype, name, propertyDesc, serializeArgument) {
		var hasValue = 'value' in Object(propertyDesc);

		var getter, setter;

		if(propertyDesc && !hasValue && (propertyDesc.get || propertyDesc.set)) {
			getter = propertyDesc.get;

			setter = propertyDesc.set && function(value) {
				var toSend = true;

				silence(function() {
					toSend = propertyDesc.set.call(this, value) !== false;
				}, this);

				if(propertyDesc && propertyDesc.normalize)
					value = propertyDesc.normalize(value);

				if(typeof serializeArgument === 'function')
					value = serializeArgument(value);

				if(toSend)
					send('set', this, null, name, value);
			};

			if(getter)
				defineGetter(prototype, name, getter);
			defineSetter(prototype, name, setter || readOnlyThrower(name));

			return null;
		} else {
			var initialValue = hasValue ? propertyDesc.value : propertyDesc;
			var coercer = initialValue && initialValue.constructor;

			getter = function() {
				if(CUSTOMER_DEBUG) {
					if(!proxyInstanceProperties[this[SPID]])
						throw new Error("Attempted to read property '" + name + "' on a previously destroyed object");
				}
				
				return proxyInstanceProperties[this[SPID]][name];
			};

			setter = function(value) {
				var props = proxyInstanceProperties[this[SPID]];
				
				if(CUSTOMER_DEBUG) {
					if(!props)
						throw new Error("Attempted to write property '" + name + "' on a previously destroyed object");
				}

				if(coercer)
					value = coercer(value);

					if(propertyDesc) {
						if(propertyDesc.normalize)
							value = propertyDesc.normalize(value);
						if(propertyDesc.set)
							value = propertyDesc.set.call(this, value);
					}


				if(props[name] != value)
					send('set', this, null, name, translateArgument(value, serializeArgument));

				props[name] = value;
			};

			defineGetter(prototype, name, getter);
			defineSetter(prototype, name, setter);

			return function(instance) {
				proxyInstanceProperties[instance[SPID]][name] = initialValue;
			};
		}
	};
});
