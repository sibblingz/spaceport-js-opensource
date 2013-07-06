define('util/oop/getClassConstructor', [
	'util/oop/getPrototypeOf',
	'util/oop/instanceof'
], function(
	getPrototypeOf,
	__instanceof
) {
	return function getClassConstructor(thing) {
		if(typeof thing === 'function') {
			// We might be a class

			// It's pretty hard to differentiate between "classes" and
			// "functions" (because in JavaScript they are the same thing).  We
			// thus don't bother trying; just say it's a class.

			// Some runtimes (such as Node 0.4.x) report regular expressions as
			// functions (because they have non-standard [[Call]] semantics).
			if(Object.prototype.toString.call(thing) === '[object RegExp]')
				return RegExp;
			
			return thing;
		} else {
			// We are assuredly an instance

			if(thing == null) { // Fuzzy compare
				// null and undefined are instances of null and undefined,
				// respectively
				return thing;
			}

			try {
				// Object cast needed in case thing is e.g. a (unboxed) number
				thing = Object(thing);
				var constructor = getPrototypeOf(thing).constructor;
				if(__instanceof(thing, constructor)) {
					// Likely a direct instance of constructor
					return getClassConstructor(constructor);
				}
			} catch(e) {
				// Bad/unknown constructor; not much we can do
				return Object;
			}
		}
	};
});
