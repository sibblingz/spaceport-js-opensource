define('flash/media/SoundTransform', [
	'util/as3/inherit',
	'util/numberDefault',
	'util/constructRef',
	'proxy/ISpaceportSerializable',
	'util/oop/instanceof',
	'util/oop/cast'
], function(
	__inherit,
	__number_default,
	__construct_ref,
	ISpaceportSerializable,
	__instanceof,
	__cast
) {
	function SoundTransform(vol, panning) {
		if(!__instanceof(this, SoundTransform))
			return __cast(vol, SoundTransform);

		this.volume = __number_default(vol, 1);
		this.pan = __number_default(panning, 0);
	}
	
	return __inherit(SoundTransform, ISpaceportSerializable, {
		// TODO: leftToLeft
		// TODO: leftToRight
		// TODO: RightToLeft
		// TODO: RightToRight
		nativeSerialize: function nativeSerialize() {
			return __construct_ref('SoundTransform', [this.volume, this.pan]);
		}
	});
});
