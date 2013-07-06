define('util/requestAnimFrame', [
	'features'
], function(
	features
) {
	// iOS lags horribly with requestAnimationFrame
	if (features.IOS_REQUESTANIMFRAME_BUG)
		return null;

	// Falsy if not supported (no fallback)
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame;
});
