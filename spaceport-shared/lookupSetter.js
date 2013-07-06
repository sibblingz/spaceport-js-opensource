define('shared/lookupSetter', [
	'shared/getOwnPropertyDescriptor'
], function(
	getOwnPropertyDescriptor
) {
	if(Object.prototype.__lookupSetter__) {
		return function lookupSetter(instance, property) {
			return instance.__lookupSetter__(property);
		};
	} else {
		return function lookupSetter(instance, property) {
			var desc = getOwnPropertyDescriptor(instance, property);
			return desc && desc.set;
		};
	}
});
