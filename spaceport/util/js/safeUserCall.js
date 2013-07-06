define('util/js/safeUserCall', [
	'util/builtin/slice',
	'util/builtin/functionPrototype'
], function(
	slice,
	funcProto
) {
	// ANY TIME YOU CALL A USER FUNCTION, USE THIS.
	return function safeUserCall(fn, thisp /*, args... */) {
		var thispArgs = slice.call(arguments, 1);

		// Similar to:
		// fn.apply(thisp, args)
		return (funcProto.call).apply(fn, thispArgs);
	};
});
