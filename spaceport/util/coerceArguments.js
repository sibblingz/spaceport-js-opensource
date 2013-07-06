define('util/coerceArguments', [
	'util/oop/cast'
], function(
	__cast
) {
	return function coerceArguments(args, constraints) {
		// FIXME How will this work with splats?

		var values = [];

		var constraintsLength = constraints.length;
		for(var i=0; i<constraintsLength; ++i) {
			var constraint = constraints[i];

			if(i > args.length) {
				// Arg was not specified; fall back to default
				if(constraint.length > 1)
					values.push(constraint[1]);
				else
					throw new Error('Argument error'); // FIXME
			} else {
				// Arg was specified; coerce
				var type = typeof constraint === 'function' ? constraint : constraint[0];

				if(args[i] == null) { // Fuzzy
					values.push(null);
				} else {
					// Because Matrix, Point, etc. lack the constructor
					// coersion code, we perform an explicit cast.
					values.push(__cast(args[i], type));
				}
			}
		}

		return values;
	};
});
