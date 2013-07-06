define('flash/events/EventDispatcher', [
	'proxy/create',
	'flash/events/Event',
	'util/broadcast/addListener',
	'util/broadcast/removeListener',
	'shared/default',
	'util/numberDefault',
	'shared/defineReadOnly',
	'util/oop/instanceof',
	'util/oop/cast',
	'util/as3/dispatchEvent',
	'flash/events/EventPhase'
], function(
	createProxyClass,
	Event,
	addBroadcastListener,
	removeBroadcastListener,
	__default,
	__number_default,
	defineReadOnly,
	__instanceof,
	__cast,
	__dispatchEvent,
	EventPhase
) {
	var globalBroadcastEvents = [
		Event.ACTIVATE,
		Event.DEACTIVATE,
		Event.MEMORY_NOTICE,
		Event.MEMORY_WARNING
	];

	return createProxyClass('EventDispatcher', {
		alwaysShadow: true,
		methods: {
			fake: {
				/**
				 *
				 * .. note::
				 *    In Flash, event priority is represented using a signed
				 *    integer.  In Spaceport, it is a double-precision
				 *    floating-point number.
				 */
				'addEventListener': function addEventListener(type, listener, useCapture, priority) {
					if(CUSTOMER_DEBUG) {
						if(typeof type === 'undefined')
							throw new TypeError("Event type cannot be undefined");
						if(typeof listener !== 'function')
							throw new TypeError("Listener type must be a function");
					}
					
					if(globalBroadcastEvents.indexOf(type) !== -1)
						addBroadcastListener(type, this);
					
					useCapture = __default(useCapture, false);
					priority = __number_default(priority, 0);
					
					if(!this.listeners)
						this.listeners = {};
					
					if(!this.listeners[type]) {
						this.listeners[type] = [];
						this.listeners[type].capture = [];
					}
					
					var listeners = this.listeners[type];
					if(useCapture)
						listeners = listeners.capture;
					
					// Remove duplicated listeners, keep old priority
					// Could probably be merged with the loop below
					for(var i=0; i<listeners.length; ++i) {
						if(listeners[i][1] === listener) {
							var oldListener = listeners.splice(i, 1)[0];
							if(oldListener[0] < priority)
								priority = oldListener[0];
						}
					}
					
					var index = 0;

					while(index < listeners.length && listeners[index][0] < priority)
						index += 1;
					
					listeners.splice(index, 0, [priority, listener]);
				},
				'removeEventListener': function removeEventListener(type, listener, useCapture) {
					if(globalBroadcastEvents.indexOf(type) !== -1)
						removeBroadcastListener(type, this);
					
					useCapture = __default(useCapture, false);
					
					if(!this.listeners)
						return;
					
					if(!this.listeners[type])
						return;
					
					var listeners = this.listeners[type];
					if(useCapture)
						listeners = listeners.capture;
						
					var index = -1;
					for(var i=0; i<listeners.length; ++i) {
						if(listeners[i][1] !== listener)
							continue;
							
						index = i;
						break;
					}

					if(index === -1)
						return;

					listeners.splice(index, 1);
					
					if(!this.listeners[type].length && !this.listeners[type].capture.length)
						delete this.listeners[type];
					
					if(!this.listeners)
						delete this.listeners; 
				},
				'dispatchEvent': function dispatchEvent(event) {
					event.target = this;
					return __dispatchEvent(this, event, EventPhase.AT_TARGET);
				},
				'hasEventListener': function hasEventListener(type) {
					return Boolean(this.listeners && this.listeners[type]);
				},
				'willTrigger': function willTrigger(type) {
					var trigger = this.hasEventListener(type);
					var parent = this.parent;
					while(parent && !trigger) {
						trigger = trigger || parent.hasEventListener(type);
						parent = parent.parent;
					}
					
					return trigger;
				}
			}
		}
	});
});
