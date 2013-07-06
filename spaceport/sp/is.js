define('sp/is', [
	'sp/toInt',
	'sp/toUint',
	'sp/Class',
	'spmetadata',
	'util/oop/getClassConstructor',
	'util/oop/isClass',
	'util/oop/instanceof'
], function(
	toInt,
	toUint,
	Class,
	SPMETADATA,
	getClassConstructor,
	isClass,
	__instanceof
) {
	// Given an interface I, yield each interface J for which
	// `x is J` is true if `x is I` is true (for all x).
	//
	// In other words, gets all the superinterfaces of an
	// interface, including itself.
	function getAllInterfaces(x) {
		var extends_ = (x[SPMETADATA] && x[SPMETADATA]['extends']) || [];
		return extends_.reduce(function(acc, parent) {
			return acc.concat(getAllInterfaces(parent));
		}, [x]);
	}

	// `lhs is rhs` from AS3
	return function is(lhs, rhs) {
		// Order of these branches matter.
		// This should (hopefully) optimize into a neat ?:
		// chain of confusion.  Sadly, this will probably
		// JIT poorly.

		// TypeError: Error #1041: The right-hand side of operator must be a class.
		if(!isClass(rhs)) {
			throw new TypeError("The right-hand side of operator must be a class.");
		}

		if(lhs == null) {  // Fuzzy
			return false;
		}

		if(rhs === Object) {
			return true;
		}

		// ::Class has its own 'is' rules.
		if(rhs === Class) {
			return isClass(lhs);
		}

		// HACK; see note [isClass implementation].
		if(rhs === Function && isClass(lhs)) {
			return false;
		}

		if(typeof lhs === 'number') {
			if(rhs === toInt) {
				return toInt(lhs) === lhs
				    && lhs <= toInt.MAX_VALUE
				    && lhs >= toInt.MIN_VALUE;
			} else if(rhs === toUint) {
				return toUint(lhs) === lhs
				    && lhs <= toUint.MAX_VALUE
				    && lhs >= toUint.MIN_VALUE;
			} else {
				return rhs === Number;
			}
		}

		if(lhs === null) {
			return false;
		}

		if(rhs[SPMETADATA] && rhs[SPMETADATA]['interface']) {
			// rhs is an interface

			var lhsClass = getClassConstructor(lhs);
			if(!lhsClass) {
				return false;  // ???
			}

			// Check metadata chain to see if any superclass
			// (or this class) says it implements 'rhs' (the
			// interface).
			var metadata = lhsClass[SPMETADATA];
			while(metadata) {
				var implements_ = metadata['implements'] || [];
				var allImplements = implements_.reduce(function(acc, x) {
					return acc.concat(getAllInterfaces(x));
				}, []);
				if(allImplements.indexOf(rhs) >= 0) {
					return true;
				}

				metadata = metadata.superclass
					&& metadata.superclass[SPMETADATA];
			}

			return false;
		} else if(typeof rhs === 'function') {
			return __instanceof(Object(lhs), rhs);
		} else {
			return false;
		}
	};
});
