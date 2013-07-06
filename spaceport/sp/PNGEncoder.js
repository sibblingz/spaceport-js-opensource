define('sp/PNGEncoder', [
	'flash/display/BitmapData',
	'proxy/ISpaceportSerializable',
	'shared/apply',
	'util/constructRef',
	'util/as3/geomToString',
	'util/as3/inherit'
], function(
	BitmapData,
	ISpaceportSerializable,
	apply,
	__construct_ref,
	__as3_toString,
	__inherit
) {
	function PNGEncoder(bitmapData) {
			// Force "coersion" for error checking
		bitmapData = BitmapData(bitmapData);
		
			// Per-instance serialization
		this.nativeSerialize = function nativeSerialize() {
			return __construct_ref('PNGEncoder', bitmapData);
		};
	}
	
	apply(PNGEncoder, {
		'encode': function encode(bitmapData) {
			return new PNGEncoder(bitmapData);
		}
	});
	
	return __inherit(PNGEncoder, ISpaceportSerializable);
});
