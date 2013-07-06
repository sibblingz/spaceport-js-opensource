define('shared/lookupGetter', [
	'shared/getOwnPropertyDescriptor'
], function(
	getOwnPropertyDescriptor
) {
	if(Object.prototype.__lookupGetter__) {
		return function lookupGetter(instance, property) {
			return instance.__lookupGetter__(property);
		};
	} else {
		return function lookupGetter(instance, property) {
			var desc = getOwnPropertyDescriptor(instance, property);
			return desc && desc.get;
		};
	}
});
