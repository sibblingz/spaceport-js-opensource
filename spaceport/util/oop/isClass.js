define('util/oop/isClass', [
	'util/oop/instanceof'
], function(
	__instanceof
) {
	// Note [isClass implementation]:
	//
	// isClass is difficult to properly implement because,
	// in JavaScript, constructor functions are
	// indistinguishable from normal functions.
	//
	// isClass's implementation is insufficient.  sp.is (in
	// module "sp/is") works around this fact.
	//
	// We can perhaps maintain a set (or WeakMap) of all
	// classes we care about, and simply test for set
	// inclusion.  This is probably less fool-proof, but
	// without WeakMap I am skeptical.

	var GLOBAL = (function() { return this; }());
	var whitelist = [
		GLOBAL.ArrayBuffer,

		GLOBAL.Uint8Array,
		GLOBAL.Int8Array,
		GLOBAL.Uint8ClampedArray,

		GLOBAL.Uint16Array,
		GLOBAL.Int16Array,

		GLOBAL.Uint32Array,
		GLOBAL.Int32Array,

		GLOBAL.Float32Array,
	];

	return function isClass(x) {
		// TODO Proper checks; see
		// note [isClass implementation]
		return (typeof x === 'function' && /^\[class .*\]$/.test(String(x)))
			|| whitelist.indexOf(x) >= 0;
	};
});
