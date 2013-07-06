define('flash/events/TimerEvent', [
	'util/as3/eventBuilder'
], function(
	eventBuilder
) {
	return eventBuilder('TimerEvent', {
		events: {
			TIMER: 'timer',
			TIMER_COMPLETE: 'timerComplete'
		}
	});
});
