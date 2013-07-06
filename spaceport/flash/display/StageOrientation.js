define('flash/display/StageOrientation', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('StageOrientation', {
		DEFAULT: 'default',
		ROTATED_LEFT: 'rotatedLeft',
		ROTATED_RIGHT: 'rotatedRight',
		UNKNOWN: 'unknown',
		UPSIDE_DOWN: 'upsideDown'
	});
});
