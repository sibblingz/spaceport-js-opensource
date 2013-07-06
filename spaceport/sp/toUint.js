define('sp/toUint', [
	'util/as3/makeClassToString',
	'shared/apply'
], function(
	makeClassToString,
	apply
) {
	function toUint(x) {
		return x >>> 0;
	}

	return apply(toUint, {
		toString: makeClassToString('uint'),

		MAX_VALUE: 4294967295,
		MIN_VALUE: 0
	});
});
