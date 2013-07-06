define('flash/utils/Endian', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('Endian', {
		BIG_ENDIAN: 'bigEndian',
	 	LITTLE_ENDIAN: 'littleEndian'
	});
});
