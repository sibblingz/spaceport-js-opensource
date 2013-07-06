define('sp/as', [
	'sp/is'
], function(
	is
) {
	// `lhs as rhs` from AS3
	return function as(lhs, rhs) {
		return is(lhs, rhs) ? lhs : null;
	};
});
