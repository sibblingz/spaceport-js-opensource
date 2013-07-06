define('flash/events/Event', [
	'flash/events/EventPhase',
	'util/builtin/slice',
	'shared/default',
	'shared/defineReadOnly',
	'shared/apply',
	'util/oop/cast',
	'util/oop/instanceof',
	'util/as3/inherit'
], function(
	EventPhase,
	slice,
	__default,
	defineReadOnly,
	apply,
	__cast,
	__instanceof,
	__inherit
) {
	var Event = function Event(type, bubbles, cancelable) {
		if(!__instanceof(this, Event))
			return __cast(type, Event);

		this.type = String(type);
		this.bubbles = __default(bubbles, false);
		this.cancelable = __default(cancelable, false);
	};
	
	Event.build = function build(patch) {
		return new Event(patch.type, patch.bubbles, patch.cancelable);
	};
	
	Event.build.args = ['type', 'bubbles', 'cancelable'];
	
	__inherit(Event, Object, {
		target: null,
		currentTarget: null,
		eventPhase: EventPhase.AT_TARGET,
		'preventDefault': function preventDefault() {
			if(!this.cancelable)
				return;
			
			this.isDefaultPrevented = function isDefaultPrevented() {
				return true;
			};
			
			// TODO: Notify native?
		},
		'isDefaultPrevented': function isDefaultPrevented() {
			return false;
		},
		'stopPropagation': function stopPropagation() {
			// Empty
		},
		'stopImmediatePropagation': function stopImmediatePropagation() {
			// Empty
		},
		'clone': function clone() {
			return new Event(this.type, this.bubbles, this.cancelable);
		},
		'formatToString': function formatToString(className, args) {
			args = slice.call(arguments, 1).map(function(property) {
				return [property, this[property]].join('=');
			}, this);
			args.unshift(className);
			
			return '[' + args.join(' ') + ']';
		},
		'toString': function toString() {
			return this.formatToString('Event', 'type', 'bubbles', 'cancelable', 'eventPhase');
		}
	});
		// Statics
	apply(Event, {
		ACTIVATE: 'activate',
		ADDED: 'added',
		ADDED_TO_STAGE: 'addedToStage',
		CHANGE: 'change',
		CLOSE: 'close',
		CONNECT: 'connect',
		COMPLETE: 'complete',
		DEACTIVATE: 'deactivate',
		ENTER_FRAME: 'enterFrame',
		EXIT_FRAME: 'exitFrame',
		FRAME_CONSTRUCTED: 'frameConstructed',
		REMOVED: 'removed',
		REMOVED_FROM_STAGE: 'removedFromStage',
		RENDER: 'render',
		RESIZE: 'resize',
		SOUND_COMPLETE: 'soundComplete',
		UNLOAD: 'unload',
		
		MEMORY_NOTICE: 'memoryNotice',
		MEMORY_WARNING: 'memoryWarning'
	});
	
	return Event;
});
