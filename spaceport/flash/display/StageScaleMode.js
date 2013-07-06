define('flash/display/StageScaleMode', ['util/as3/createEnum'], function(__createEnum) {
	return __createEnum('StageScaleMode', {
		EXACT_FIT: 'exactFit',
		NO_BORDER: 'noBorder',
		NO_SCALE: 'noScale',
		SHOW_ALL: 'showAll'
	});
});
