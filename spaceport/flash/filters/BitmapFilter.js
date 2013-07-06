define('flash/filters/BitmapFilter', [
	'util/as3/inherit',
	'proxy/ISpaceportSerializable'
], function(
	__inherit,
	ISpaceportSerializable
) {
	function BitmapFilter() {
		throw new Error('ArgumentError: BitmapFilter class cannot be instantiated');
	}
	
	return __inherit(BitmapFilter, ISpaceportSerializable);
});
