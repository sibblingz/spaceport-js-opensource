define('flash/filters/GlowFilter', [
	'util/as3/filterBuilder'
], function(
	filterBuilder
) {
	return filterBuilder('GlowFilter', [
		['color', 0xFF0000],
		['alpha', 1.0],
		['blurX', 6.0],
		['blurY', 6.0],
		['strength', 2],
		['quality', 1],
		['inner', false],
		['knockout', false]
	]);
});
