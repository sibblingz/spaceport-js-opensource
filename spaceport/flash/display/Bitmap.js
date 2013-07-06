define('flash/display/Bitmap', [
	'proxy/create',
	'flash/display/DisplayObject',
	'flash/display/BitmapData',
	'util/oop/cast',
	'shared/default',
	'bridge/send',
	'bridge/silence',
	'util/oop/instanceof',
	'flash/geom/Rectangle',
	'util/display/getBounds'
], function(
	createProxyClass,
	DisplayObject,
	BitmapData,
	__cast,
	__default,
	send,
	silence,
	__instanceof,
	Rectangle,
	helper_getBounds
) {
	return createProxyClass('Bitmap', DisplayObject, {
		constructor: function Bitmap(bitmapData, pixelSnapping, smoothing) {
			bitmapData = __default(bitmapData, null);
			if(bitmapData && !__instanceof(bitmapData, BitmapData))
				throw new Error('Argument Error, bitmapData must be an instance of BitmapData');
			
			this.bitmapData = __default(bitmapData, null);
			this.pixelSnapping = __default(pixelSnapping, 'auto');
			this.smoothing = __default(smoothing, false);
		},
		properties: {
			'smoothing': false,
			'pixelSnapping': 'auto',
			'bitmapData': {
				value: null,
				set: function(bitmapData) {
					if(bitmapData == null)  // Fuzzy
						return null;
					else
						return __cast(bitmapData, BitmapData);
				}
			}
		},
		patch: function patch(target, patch, mutator) {
			if(patch.bitmapData) {
				var bitmapData = mutator.patch(target.bitmapData, patch.bitmapData);
				send('get', target, bitmapData, 'bitmapData');
				silence(function() {
					target.bitmapData = bitmapData;
				});
			}
		},
		methods: {
			fake: {
				'getBounds': function getBounds(targetCoordinateSpace) {
					if(!this.bitmapData)
						return new Rectangle();
					
					return helper_getBounds(this.bitmapData.rect, this, targetCoordinateSpace);
				},
				'destroy': function destroy(deep) {
					if(deep) {
						var bd = this.bitmapData;
						if(bd)
							bd.destroy(deep);
					}

					DisplayObject.prototype.destroy.call(this, deep);
				}
			},
		}
	});
});
