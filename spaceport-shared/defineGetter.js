define('shared/defineGetter', [
	'shared/defineProperty'
], function(
	defineProperty
) {
	if(Object.prototype.__defineGetter__) {
		return function defineGetter(instance, property, getter) {
			if(PROFILE)
				getter = YAHOO.tool.Profiler.instrument('get_' + property, getter);

			instance.__defineGetter__(property, getter);
		};
	} else {
		return function defineGetter(instance, property, getter) {
			if(PROFILE)
				getter = YAHOO.tool.Profiler.instrument('get_' + property, getter);

			defineProperty(instance, property, {
				get: getter,
				enumerable: true,
				configurable: true
			});
		};
	}
});
