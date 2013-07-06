define('shared/defineSetter', [
	'shared/defineProperty'
], function(
	defineProperty
) {
	if(Object.prototype.__defineSetter__) {
		return function defineSetter(instance, property, setter) {
			if(PROFILE)
				setter = YAHOO.tool.Profiler.instrument('set_' + property, setter);

			instance.__defineSetter__(property, setter);
		};
	} else {
		return function defineSetter(instance, property, setter) {
			if(PROFILE)
				setter = YAHOO.tool.Profiler.instrument('set_' + property, setter);

			defineProperty(instance, property, {
				set: setter,
				enumerable: true,
				configurable: true
			});
		};
	}
});
