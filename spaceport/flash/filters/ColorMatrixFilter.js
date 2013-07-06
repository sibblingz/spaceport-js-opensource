define('flash/filters/ColorMatrixFilter', [
	'util/as3/filterBuilder'
], function(
	filterBuilder
) {
	return filterBuilder('ColorMatrixFilter', [
		['matrix', null]
	]);
});
