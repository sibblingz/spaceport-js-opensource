define('flash/filters/BlurFilter', [
	'util/as3/filterBuilder'
], function(
	filterBuilder
) {
	return filterBuilder('BlurFilter', [
		['blurX', 4],
		['blurY', 4],
		['quality', 1]
	]);
});
