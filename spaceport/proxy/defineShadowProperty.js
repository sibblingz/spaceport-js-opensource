define('proxy/defineShadowProperty', [
	'bridge/send',
	'shared/defineGetter',
	'shared/defineSetter',
	'util/oop/cast'
], function(
	send,
	defineGetter,
	defineSetter,
	__cast
) {
	/**
	 * Defines a shadow property on an instance of a proxy class
	 */
	return function defineShadowProperty(instance, name, cls, serializeArgument) {
		var value = new cls.shadow();

		defineGetter(instance, name, function() {
			return value;
		});

		defineSetter(instance, name, function(property) {
			property = __cast(property, cls);
			if(property != value) {
				var safeValue = serializeArgument
					? serializeArgument(value)
					: value;
				send('set', this, null, name, safeValue);
			}

			property = value;
		});

		send('get', instance, value, name);
	};
});
