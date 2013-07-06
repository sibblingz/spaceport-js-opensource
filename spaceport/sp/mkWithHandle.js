define('sp/mkWithHandle', [
	'util/builtin/functionPrototype'
], function(
	funcProto
) {
	var GLOBAL = (function() { return this; })();

	// Makes a 'with' statement proxy.
	//
	// var x;
	// with (obj) {
	//   f(x);
	//   x = 10;
	//   undeclared();
	//   (undeclared)();
	// }
	//
	// is converted to
	//
	// var x;
	//
	// {
	//   var f_handle = mkWithHandle(
	//     obj, 'f',
	//     function get_f() { return f; },
	//     function set_f(value) { f = value; }
	//   );
	//   var x_handle = mkWithHandle(
	//     obj, 'x',
	//     function get_x() { return x; },
	//     function set_x(value) { x = value; }
	//   );
	//   var undeclared_handle = mkWithHandle(
	//     obj, 'undeclared',
	//     null, null
	//   );
	//
	//   f_handle.value(x_handle.value);
	//   x_handle.value = 10;
	//   undeclared_handle.invoke();
	//   (null, undeclared_handle.value)();
	// }
	return function mkWithHandle(obj, propName, getter, setter) {
		// TypeError: Error #1009: Cannot access a property or method of a null object reference.
		if (obj == null) {  // Fuzzy
			throw new TypeError("Cannot access a property or method of a null object reference.");
		}

		return {
			invoke: function invoke(/* ... */) {
				var fn = this.value;

				// If found on object:
				// TypeError: Error #1006: propName is not a function.
				//
				// If found using getter:
				// TypeError: Error #1006: value is not a function.
				if(typeof fn !== 'function') {
					throw new TypeError(propName + " is not a function.");
				}

				// NOTE: This is safer than: fn.apply(obj, arguments);
				return funcProto.apply.call(fn, obj, arguments);
			},

			get value() {
				if(propName in obj) {
					return obj[propName];
				} else if(getter) {
					return getter();
				} else if(propName in GLOBAL) {
					return GLOBAL[propName];
				} else {
					// ReferenceError: Error #1065: Variable undeclaredIdentifier is not defined.
					throw new ReferenceError(
						"Variable " + propName + " is not defined."
					);
				}
			},

			set value(v) {
				if(propName in obj) {
					obj[propName] = v;
				} else if(setter) {
					setter(v);
				} else {
					GLOBAL[propName] = v;
				}
			}
		};
	};
});
