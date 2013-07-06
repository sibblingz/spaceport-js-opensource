define('shared/apply', [
	'shared/defineGetter',
	'shared/defineSetter',
	'shared/lookupGetter',
	'shared/lookupSetter'
], function(
	defineGetter,
	defineSetter,
	lookupGetter,
	lookupSetter
) {
	/**
	 * Applies all properties of b to a, and returns a
	 */
	return function apply(a, b) {
		for(var property in b) {
			var getter = lookupGetter(b, property);
			var setter = lookupSetter(b, property);

			if(getter || setter) {
				if(getter)
					defineGetter(a, property, getter);
				if(setter)
					defineSetter(a, property, setter);
			} else
				a[property] = b[property];
		}

		return a;
	};
});
