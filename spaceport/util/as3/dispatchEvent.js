define('util/as3/dispatchEvent', [
	'shared/defineReadOnly',
	'util/js/safeUserCall',
	'flash/events/EventPhase'
], function(
	defineReadOnly,
	safeUserCall,
	EventPhase
) {
	return function dispatchEvent(eventLocation, event, phase) {
			// No listeners at all
		if(!eventLocation.listeners)
			return true;
		
			// Select the listeners according to the phase
		var listeners = eventLocation.listeners[event.type];
		
			// Nothing to dispatch
		if(!listeners)
			return true;
		
			// Capture phase uses special listeners
		if(phase === EventPhase.CAPTURING_PHASE)
			listeners = listeners.capture;
		
			// We clone the listeners array since event listeners
			// can be removed and edited during listeners
		listeners = listeners.concat();

			// Set current target to whoever is currently processing the event
		event.currentTarget = eventLocation;
		
			// 'stopImmidiatePropagation' will stop all forthcoming listeners
		var eventControlFlow = true;
		event.stopImmediatePropagation = function stopImmediatePropagation() {
				// Immediate stop
			eventControlFlow = false;
			
				// Also stop propagation
			this.stopPropagation();
		};
		
			// Call listeners with priority in mind
		while(listeners.length && eventControlFlow) {
			var fn = listeners.pop()[1];
			fn(event);  // Call with global 'this'.
		}
		
		// Don't pollute and let the GC pick this scope up
		delete event.stopImmediatePropagation;
		
		return eventControlFlow && !event.isDefaultPrevented();
	};
});
