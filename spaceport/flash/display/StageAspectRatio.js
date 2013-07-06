define('flash/display/StageAspectRatio', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('StageAspectRatio', {
		LANDSCAPE: 'landscape',
		PORTRAIT: 'portrait'
	});
});
