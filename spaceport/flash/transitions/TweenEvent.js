define('flash/transitions/TweenEvent', [
	'flash/events/Event',
	'util/as3/inherit',
	'shared/apply'
], function(
	Event,
	__inherit,
	apply
) {
	function TweenEvent(type, time, position, bubbles, cancelable) {
		Event.call(this, type, bubbles, cancelable);
		
		this.time = Number(time);
		this.position = Number(position);
	}
	
	apply(TweenEvent, {
		MOTION_CHANGE: 'motionChange',
		MOTION_FINISH: 'motionFinish',
		MOTION_LOOP: 'motionLoop',
		MOTION_RESUME: 'motionResume',
		MOTION_START: 'motionStart',
		MOTION_STOP: 'motionStop'
	});
	
	return __inherit(TweenEvent, Event, {
		'clone': function clone() {
			return new TweenEvent(this.type, this.time, this.position, this.bubbles, this.cancelable);
		}
	});
});
