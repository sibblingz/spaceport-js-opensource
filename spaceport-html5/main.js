define('main', [
	'renderer'
], function(
	renderer
) {
	renderer.fastMode();
	window.HTML5Renderer = renderer;
});
