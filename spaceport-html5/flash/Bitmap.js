define('flash/Bitmap', [
	'flash/DisplayObject',
	'util/lightClass'
], function(
	DisplayObject,
	lightClass
) {
	var Bitmap = lightClass(DisplayObject, {
		constructor: function (bitmapData, smoothing, pixelSnapping) {
			this.displayList = null;

			this.bitmapData = bitmapData;
			this.smoothing = smoothing;
			this.pixelSnapping = pixelSnapping;
		},
		'smoothing': {
			get: function get_smoothing() {
				return this._smoothing;
			},
			set: function set_smoothing(value) {
				// TODO
				this._smoothing = value;
				//this.element.style.imageRendering = value ? 'optimizeQuality' : 'optimizeSpeed';
			}
		},
		'bitmapData': {
			get: function get_bitmapData() {
				return this._bitmapData;
			},
			set: function set_bitmapData(value) {
				this.displayList = value ? value.displayList : null;
				this._bitmapData = value;
			}
		},
		'pixelSnapping': {
			get: function get_pixelSnapping() {
				// TODO
			},
			set: function set_pixelSnapping(value) {
				// TODO
			}
		}
	});

	return Bitmap;
});
