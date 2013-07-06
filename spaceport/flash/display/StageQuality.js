define('flash/display/StageQuality', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('StageQuality', {
		BEST: 'best',
		HIGH: 'high',
		LOW: 'low',
		MEDIUM: 'medium'
	});
});
