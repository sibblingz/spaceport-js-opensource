define('bridge', [
	'flash/events/Event',
	'objectMutator',
	'shared/apply',
	'shared/objectKeys',
	'shared/hasProperty',
	'shared/fromCharCode',
	'shared/base64/decodeToString',
	'util/broadcast/listeners',
	'util/builtin/slice',
	'util/translateArgument',
	'bridge/buffer',
	'bridge/send',
	'bridge/silence',
	'bridge/dictionary',
	'bridge/ssa',
	'sp/trace',
	'stage',
	'capabilities',
	'flash/display/Stage',
	'util/warnDeveloper',
	'shared/version',
	'domain/nativeDomain'
], function(
	Event,
	objectMutator,
	apply,
	objectKeys,
	hasProperty,
	fromCharCode,
	base64DecodeToString,
	broadcast,
	slice,
	translateArgument,
	bridgeBuffer,
	send,
	silence,
	dictionary,
	ssa,
	trace,
	stage,
	capabilities,
	Stage,
	warnDeveloper,
	SPACEPORT_VERSION,
	nativeDomain
) {
	/**
	 * Spaceport's communication bridge
	 */

	function write(buffer) {
		if(false) {
			if(buffer.length) {
				trace("> " + buffer.join("\n> "));
			}
		}
		
		SendMultiNativeCommand(buffer.map(function(cmd) {
			return cmd.join('!');
		}).join('*'));
	}
	
	function flush() {
			// Clean up the SSA tree when done
		ssa.length = 0;

			// Write a copy of the buffer and clear the buffer immediately to
			// prevent race condition problems
		return write(bridgeBuffer.splice(0, bridgeBuffer.length));
	}
	
	function compareVersions(a, b) {
		a = a.split('.').map(Number);
		b = b.split('.').map(Number);

		// Ensure version numbers are of the same length
		while(a.length > b.length)
			b.push(0);
		while(b.length > a.length)
			a.push(0);

		for(var i=0; i<a.length; ++i) {
			if(a[i] > b[i]) {
				return -1;
			} else if(a[i] < b[i]) {
				return 1;
			}
		}

		return 0;
	}

	var genesisCallback = null;

	function genesis(version, caps) {		
		if(CUSTOMER_DEBUG) {
			// Versions < 3.1 didn't give a version number; assume it's 3.0
			var nativeVersion = version || '3.0';
			var versionDiff = compareVersions(nativeVersion, SPACEPORT_VERSION);
			if(versionDiff < 0) {
				warnDeveloper("Native version (" + nativeVersion + ") is newer than spaceport.js version (" + SPACEPORT_VERSION + "); please update spaceport.js.", "@docs@/development/common_problems.html#native-newer");
			} else if(versionDiff > 0) {
				warnDeveloper("spaceport.js version (" + SPACEPORT_VERSION + ") is newer than native version (" + nativeVersion + "); please update your native binary.", "@docs@/development/common_problems.html#js-newer");
			}
		}
		
		// Initialize the dictionary and capabilities
		dictionary[1] = stage;
		
		// Make sure to not stumble over any caps references
		objectKeys(caps).forEach(function(fqn) {
			if(!capabilities[fqn])
				capabilities[fqn] = {};
				
			apply(capabilities[fqn], caps[fqn]);
		});

		if(genesisCallback)
			genesisCallback();

		// Flush everything that was accumulated until genesis
		return flush();
	}

	var shadowMutator = objectMutator(nativeDomain);

	// Dispatches the given event, patches the given target and
	// returns the number of events in the queue processed.
	function handleEvent(eventObject) {
		if(hasProperty(eventObject, 'target')) {
			// Targeted event
			var targetId = eventObject.target
			var target = dictionary[targetId];
			
			if(!target) {
				if(DEBUG) {
					console.error("Invalid target: " + targetId);
				}
				
				return 1;
			}
			
			// extraInfo patching before the event is dispatched
			if(hasProperty(eventObject, 'extraInfo'))
				shadowMutator.patch(target, eventObject.extraInfo);
			
			// Public event if any
			if(hasProperty(eventObject, 'event') && target.willTrigger(eventObject.event.type)) {
				var event = shadowMutator.patch(null, eventObject.event);
				
				// event.target will be set here
				target.dispatchEvent(event);
				
				// Skip over the next N events, and this event if the event was cancled
				if(event.cancelable && event.isDefaultPrevented())
					return eventObject.event.cancelable + 1;
			}
		} else {
			// Broadcast event
			var listeners = broadcast[eventObject.event.type];
			
			// Nothing is listening, we're done
			if(listeners) {
				var event = shadowMutator.patch(null, eventObject.event);
				
				// We need to clone the list of listeners in
				// case one listener adds a new event listener.
				listeners = listeners.concat();
				for(var i=0; i<listeners.length; ++i)
					listeners[i].dispatchEvent(event);
			}
		}
		
		// Default case
		return 1;
	}

	// Shared instance for GC efficiency.
	var enterFrameEvent = new Event(Event.ENTER_FRAME);

	function dispatchEnterFrameEvent() {
		var listeners = broadcast[enterFrameEvent.type];
		if(listeners) {
			// We need to clone the list of listeners in
			// case one listener adds a new event listener.
			listeners = listeners.concat();
			for(var i=0; i<listeners.length; ++i)
				listeners[i].dispatchEvent(enterFrameEvent);
		}
	}
		
	function eventLoop(events) {
		if(false) {
			if(events && events.length) {
				trace("< " + events.map(JSON.stringify).join("\n< "));
			}
		}

		dispatchEnterFrameEvent();

		if(events) {
			var i = 0;
			while(i < events.length)
				i += handleEvent(events[i]);
		}

		return flush();
	}

	function load(options, callback) {
		genesisCallback = callback;
		SendMultiNativeCommand('load');
	}

	if(DEBUG) {
		return {
			load: load,
			send: send,
			buffer: bridgeBuffer,
			genesis: genesis,
			recieve: eventLoop,
			dictionary: dictionary,
			nextFrame: dispatchEnterFrameEvent
		};
	} else {
		return {
			load: load,
			send: send,
			genesis: genesis,
			recieve: eventLoop
		};
	}
});
