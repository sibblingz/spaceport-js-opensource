define('sp/args', [
	'shared/defineNonEnumerable',
	'util/builtin/slice'
], function(
	defineNonEnumerable,
	slice
) {
	// This function coerses a JS `arguments` object into an AS3 `arguments`
	// array.
	//
	// Note: the Adobe documentation lies.  `arguments` in AS3 is an array
	// (`arguments is Array` returns `true`).  `callee` is tacked on
	// (non-enumerable).
	return function args(argsObject, count) {
		var argsArray = slice.call(argsObject, count);
		defineNonEnumerable(argsArray, 'callee', argsObject.callee);
		return argsArray;
	};
});
