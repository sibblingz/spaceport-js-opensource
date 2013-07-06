define('flash/BitmapData', [
	'display/CanvasDisplayList',
	'util/lightClass'
], function(
	CanvasDisplayList,
	lightClass
) {
	function intToColorString(color) {
		var channelMask = 0xFF;
		var r = (color >>> 16) & channelMask;
		var g = (color >>>  8) & channelMask;
		var b = (color >>>  0) & channelMask;
		var a = (color >>> 24) & channelMask;

		return 'rgba(' + [r, g, b, a / channelMask] + ')';
	}

	var BitmapData = lightClass({
		constructor: function (width, height, transparency, fillColor) {
			var canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			var context = canvas.getContext('2d');

			this.colorMask = transparency === true ? 0xFFFFFFFF : 0x00FFFFFF;
			this.fillColor = fillColor || 0xFFFFFFFF;

			context.fillStyle = intToColorString(fillColor & this.colorMask);
			context.clearRect(0, 0, width, height);
			context.fillRect(0, 0, width, height);

			this.element = canvas;
			this.context = context;

			this.width = width;
			this.height = height;

			this.displayList = new CanvasDisplayList(canvas);
		},
		'draw': function draw(source, matrix /* TODO more args */) {
			// TODO
		},
		'copyPixels': function copyPixels(sourceBitmapData, sourceRect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha) {
			this.copyPixelsImpl(sourceBitmapData.element, sourceRect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha);
		},
		'copyPixelsImpl': function copyPixelsImpl(source, sourceRect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha) {
			// TODO Alpha stuff

			if(!sourceRect) {
				sourceRect = {
					x: 0, y: 0,
					width: source.width, height: source.height
				};
			}

			if(!destPoint) {
				destPoint = { x: 0, y: 0 };
			}

			this.context.globalCompositeOperation = 'source-over';
			this.context.drawImage(
				// Source
				source,
				sourceRect.x, sourceRect.y,
				sourceRect.width, sourceRect.height,

				// Destination
				destPoint.x, destPoint.y,
				sourceRect.width, sourceRect.height
			);
		}
	});

	return BitmapData;
});
