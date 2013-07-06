define('sp/toInt', [
	'util/as3/makeClassToString',
	'shared/apply'
], function(
	makeClassToString,
	apply
) {
	function toInt(x) {
		return x >> 0;
	}

	return apply(toInt, {
		toString: makeClassToString('int'),

		MAX_VALUE: 2147483647,
		MIN_VALUE: -2147483648
	});
});
