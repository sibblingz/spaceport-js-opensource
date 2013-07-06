define('util/as3/timerWrapClosure', [
	'util/builtin/slice',
	'util/oop/cast'
], function(
	slice,
	__cast
) {
	return function timerWrapClosure(original) {
		return function(closure, delay/*, ...args */) {
			var args = slice.call(arguments, 2);
			
			closure = __cast(closure, Function);
			if(args.length)
				closure = closure.bind.apply(closure, [closure].concat(args));
			
			return original(closure, Number(delay));
		};
	};
});
