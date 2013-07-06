define('sp/mkPropHandle', [
	'util/builtin/functionPrototype',
	'sp/get',
	'sp/set'
], function(
	funcProto,
	get,
	set
) {
	return function mkPropHandle(obj, prop) {
		if (obj == null) {  // Fuzzy
			throw new TypeError("Cannot access a property or method of a null object reference.");
		}
		return {
			invoke: function invoke(/* ... */) {
				var fn = this.value;

				// If found on object:
				// TypeError: Error #1006: prop is not a function.
				//
				// If found using getter:
				// TypeError: Error #1006: value is not a function.
				if(typeof fn !== 'function') {
					throw new TypeError(prop + " is not a function.");
				}

				// NOTE: This is safer than: fn.apply(obj, arguments);
				return funcProto.apply.call(fn, obj, arguments);
			},

			get value() {
				return get(obj, prop);
			},

			set value(v) {
				set(obj, prop, v);
			}
		};
	};
});
