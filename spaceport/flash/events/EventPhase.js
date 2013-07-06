define('flash/events/EventPhase', [
	'util/as3/createEnum'
], function(
	__createEnum
) {
	return __createEnum('EventPhase', {
		CAPTURING_PHASE: 1,
		AT_TARGET: 2,
		BUBBLING_PHASE: 3
	});
});
