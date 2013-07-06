define('flash/geom/ColorTransform', [
	'proxy/ISpaceportSerializable',
	'util/numberDefault',
	'util/constructRef',
	'util/as3/geomToString',
	'util/as3/inherit'
], function(
	ISpaceportSerializable,
	__number_default,
	__construct_ref,
	__as3_toString,
	__inherit
) {
	function ColorTransform(redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
		this.redMultiplier = __number_default(redMultiplier, 1);
		this.greenMultiplier = __number_default(greenMultiplier, 1);
		this.blueMultiplier = __number_default(blueMultiplier, 1);
		this.alphaMultiplier = __number_default(alphaMultiplier, 1);
		
		this.redOffset = __number_default(redOffset, 0);
		this.greenOffset = __number_default(greenOffset, 0);
		this.blueOffset = __number_default(blueOffset, 0);
		this.alphaOffset = __number_default(alphaOffset, 0);
	}
	
	return __inherit(ColorTransform, ISpaceportSerializable, {
		get color() {
			return (this.redOffset   & 0xFF) << 16 | 
				   (this.greenOffset & 0xFF) <<  8 | 
				   (this.blueOffset  & 0xFF) <<  0;
		},
		set color(value) {
			this.redMultiplier   = 0;
			this.greenMultiplier = 0;
			this.blueMultiplier  = 0;
			
			this.redOffset   = (value >> 16) & 0xFF;
			this.greenOffset = (value >>  8) & 0xFF;
			this.blueOffset  = (value >>  0) & 0xFF;
		},
		'concat': function concat(second) {
			this.redOffset   += this.redMultiplier   * second.redOffset;
			this.greenOffset += this.greenMultiplier * second.greenOffset;
			this.blueOffset  += this.blueMultiplier  * second.blueOffset;
			this.alphaOffset += this.alphaMultiplier * second.alphaOffset;
			
			this.redMultiplier   *= second.redMultiplier;
			this.greenMultiplier *= second.greenMultiplier;
			this.blueMultiplier  *= second.blueMultiplier;
			this.alphaMultiplier *= second.alphaMultiplier;
		},
		'toString': function toString() {
			return __as3_toString(this,
				'redMultiplier', 'greenMultiplier', 'blueMultiplier', 'alphaMultiplier',
				'redOffset', 'greenOffset', 'blueOffset', 'alphaOffset'
			);
		},
		'nativeSerialize': function nativeSerialize() {
			return __construct_ref('ColorTransform', [
				this.redMultiplier, this.greenMultiplier, this.blueMultiplier, this.alphaMultiplier,
				this.redOffset, this.greenOffset, this.blueOffset, this.alphaOffset
			]);
		}
	});
});
