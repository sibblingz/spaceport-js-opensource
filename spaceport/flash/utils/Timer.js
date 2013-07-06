define('flash/utils/Timer', [
	'flash/events/EventDispatcher',
	'flash/events/TimerEvent',
	'util/builtin/isNaN',
	'util/numberDefault',
	'shared/defineReadOnly',
	'util/as3/inherit',
	'shared/defineGetter',
	'spid'
], function(
	EventDispatcher,
	TimerEvent,
	isNaN,
	__number_default,
	defineReadOnly,
	__inherit,
	defineGetter,
	SPID
) {
		// Timer id => setTimeout() id mappings
	var runningTimeoutIds = {};

	function Timer(delay, repeatCount) {
		EventDispatcher.call(this);

		delay = Number(delay);

		if(isNaN(delay) || delay < 0)
			throw new Error('The Timer delay specified is out of range.');

		this.delay = delay;
		this.repeatCount = __number_default(repeatCount, 0);

		defineReadOnly(this, 'currentCount', 0);
	};
	
	return __inherit(Timer, EventDispatcher, {
		get running() {
			return Boolean(runningTimeoutIds[this[SPID]]);
		},
		start: function start() {
				// Timer already running; do not restart it.
			if(this.running)
				return;

				// FIXME Should this be "recursive" (as it is now)
				// or using setInterval?  What does Flash's VM do?
			(function next(self) {
				runningTimeoutIds[self[SPID]] = setTimeout(function() {
						// Increment current count
					var newCount = self.currentCount + 1;
					defineReadOnly(self, 'currentCount', newCount);

						// Dispatch timer tick event
					self.dispatchEvent(new TimerEvent(TimerEvent.TIMER));

						// Modification during events
					if(!self.running)
						return;

						// Run the next tick if we aren't done
					if(newCount < self.repeatCount || self.repeatCount === 0) {
						next(self);
						return;
					}

					// Finish the timer and stop it
					self.stop();
					self.dispatchEvent(new TimerEvent(TimerEvent.TIMER_COMPLETE));
				}, self.delay);
			})(this);
		},
		stop: function stop() {
			clearTimeout(runningTimeoutIds[this[SPID]]);

			delete runningTimeoutIds[this[SPID]];
		},
		reset: function reset() {
			this.stop();

			defineReadOnly(this, 'currentCount', 0);
		}
	});
});
