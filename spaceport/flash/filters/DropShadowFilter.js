define('flash/filters/DropShadowFilter', [
	'util/as3/filterBuilder'
], function(
	filterBuilder
) {
	return filterBuilder('DropShadowFilter', [
		['distance', 4.0],
		['angle', 45],
		['color', 0],
		['alpha', 1.0],
		['blurX', 4.0],
		['blurY', 4.0],
		['strength', 1.0],
		['quality', 1],
		['inner', false],
		['knockout', false],
		['hideObject', false]
	]);
});
