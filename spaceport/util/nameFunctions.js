define('util/nameFunctions', [
	'shared/lookupGetter',
	'shared/lookupSetter',
	'shared/objectKeys'
], function(
	lookupGetter,
	lookupSetter,
	objectKeys
) {
	function nameFunction(obj, name) {
		if(typeof obj === 'function') {
			obj.displayName = name;
		}
	}

	return function nameFunctions(obj, rootName) {
		if(!obj)
			return;

		rootName = rootName || '';

		objectKeys(obj).forEach(function(name) {
			var getter = lookupGetter(obj, name);
			if(getter)
				nameFunction(getter, rootName + 'get ' + name);

			var setter = lookupSetter(obj, name);
			if(setter)
				nameFunction(setter, rootName + 'set ' + name);

			if(!getter && !setter) {
				nameFunction(obj[name], rootName + name);
			}
		});
	};
});
