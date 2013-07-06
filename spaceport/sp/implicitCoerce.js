define('sp/implicitCoerce', [
	'sp/toInt',
	'sp/toUint',
	'sp/is'
], function(
	toInt,
	toUint,
	is
) {
	// AS3 implicit "coercion" as a result of assignment, `return`, etc.
	//
	// For example:
	//
	// var x:int = "42";
	// => var x = implicitCoerce("42", int);
	return function implicitCoerce(value, type) {
		if(is(value, type)) {
			return value;
		}

		switch(type) {
			case String:
			case Object:
					if(value == null) {  // Fuzzy
						return null;
					}
				// FALL THROUGH
			case toInt:
			case toUint:
			case Number:
			case Boolean:
				return type(value);

			default:
					if(value == null) {  // Fuzzy
						return null;
					}

					// I think that *assignment* or *returning* (outside of
					// pattern matching) throwing a runtime error is the
					// stupidest thing a language designer can ever do.  But
					// hey, compatibility...
					throw new TypeError("Implicit coercion to " + type + " failed");  // FIXME Message
		}
	};
});
