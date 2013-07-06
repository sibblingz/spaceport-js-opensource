define('shared/applyVariadic', [
	'shared/apply',
	'shared/slice'
], function(
	apply,
	slice
) {
	return function applyVariadic(a /*, etc... */) {
		slice.call(arguments, 1).forEach(apply.bind(null, a));
		return a;
	};
});
