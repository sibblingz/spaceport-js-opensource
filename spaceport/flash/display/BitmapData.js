define('flash/display/BitmapData', [
	'proxy/create',
	'flash/geom/Rectangle',
	'shared/default',
	'util/numberDefault',
	'shared/defineReadOnly',
	'flash/geom/Matrix',
	'flash/geom/ColorTransform',
	'flash/geom/Point',
	'util/coerceArguments',
	'util/oop/instanceof',
	'flash/display/DisplayObject',
	'util/oop/className',
	'sp/toInt',
	'util/error/coercionFailed'
], function(
	createProxyClass,
	Rectangle,
	__default,
	__number_default,
	defineReadOnly,
	Matrix,
	ColorTransform,
	Point,
	coerceArguments,
	__instanceof,
	DisplayObject,
	__class_name,
	toInt,
	coercionFailed
) {
	var BitmapData = createProxyClass('BitmapData', {
		constructor: function BitmapData(width, height, transparent, fillColor) {
			width = toInt(width);
			height = toInt(height);

			if(width >= 32768 || height >= 32768 || width < 1 || height < 1) {
				throw new Error("Invalid BitmapData.", 2015);
			}

			transparent = __default(transparent, true);
			fillColor = __number_default(fillColor, 0xFFFFFFFF);
			
			defineReadOnly(this, 'width', width);
			defineReadOnly(this, 'height', height);
			defineReadOnly(this, 'transparent', transparent);
		},
		build: function build(patch, mutator) {
			return new BitmapData.shadow(patch.width, patch.height, patch.transparent);
		},
		methods: {
			real: {
				// coerceArguments validates the arguments.  We need a function
				// for thee methods because BitmapData needs to be referenced
				// (and BitmapData is undefined if we use an array literal).
				'draw': function draw(source, matrix, colorTransform, blendMode, clipRect, smoothing) {
					// We don't have a real IBitmapDrawable interface, so we
					// need to manually check types.
					if(!__instanceof(source, BitmapData) && !__instanceof(source, DisplayObject))
						throw coercionFailed(source, "IBitmapDrawable");

					coerceArguments(arguments, [Object, [Matrix, null], [ColorTransform, null], [String, null], [Rectangle, null], [Boolean, false]])
				},
				'copyPixels': function copyPixels(sourceBitmapData, sourceRect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha) {
					coerceArguments(arguments, [BitmapData, Rectangle, Point, [BitmapData, null], [Point, null], [Boolean, false]]);
				},
				'fillRect': function(rect, color) {
					if(rect == null) // Fuzzy
						throw new TypeError("rect is null"); // FIXME Message

					coerceArguments(arguments, [Rectangle, Number]);
				},
				'lock': true,
				'threshold': true,
				'unlock': true,
				'setPixel': true
			},
			fake: {
				'rect': {
					get: function() {
						return new Rectangle(0, 0, this.width, this.height);
					}
				},
				'dispose': function dispose() {
					// FIXME
					this.destroy();
				}
			}
		}
	});

	return BitmapData;
});
