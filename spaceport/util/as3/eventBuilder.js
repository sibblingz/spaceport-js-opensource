define('util/as3/eventBuilder', [
	'flash/events/Event',
	'util/js/nameFunction',
	'flash/events/EventPhase',
	'util/builtin/slice',
	'shared/hasProperty',
	'shared/apply',
	'util/oop/cast',
	'util/oop/instanceof',
	'util/as3/inherit',
	'util/as3/fqnToClassName',
	'util/builtin/objectCreate'
], function(
	Event,
	__name_function,
	EventPhase,
	slice,
	hasProperty,
	apply,
	__cast,
	__instanceof,
	__inherit,
	fqnToClassName,
	objectCreate
) {
	/**
	 * Convinient function to generate functions that build events
	 * Returns a function that works with object mutator
	 */
	function mutator_eventBuild(cls) {
		return function(patch) {
			var instance = objectCreate(cls.prototype);
			cls.apply(instance, cls.build.args.map(function(property) { 
				return patch[property];
			}));
		
			return instance;
		};
	}
	
	/**
	 * Creates an event class from config
	 *
	 * Config arguments:
	 *	- args: Arguments after 'cancelable' in the constructor
	 *	- constructor: A function to call on the instance when created
	 *	- methods: Methods on the event class
	 *	- events: All static event strings (key-value pairs)
	 */
	return function createEventSubclass(fqn, superclass, config) {
			// No valid superclass given, inherit from Event
		if(typeof superclass !== 'function') {
			config = superclass;
			superclass = Event;
		}
		
		var superArgs = superclass.build.args;
		config.args = superArgs.concat(config.args || []);
		
		var name = fqnToClassName(fqn);
		var result = __name_function(name, function(value) {
			if(!__instanceof(this, result))
				return __cast(value, result);

				// Call superclass with known arguments
			superclass.apply(this, slice.call(arguments, 0, superArgs.length));
			
				// Call this class's constructor
			if(hasProperty(config, 'constructor'))
				config.constructor.apply(this, arguments);
		});
		
		__inherit(apply(result, config.events || {}),
			superclass,
			apply(config.methods || {}, {
				'clone': function clone() {
					return result.build(this);
				},
				'toString': function toString() {
					return this.formatToString.apply(this, [name].concat(config.args));
				}
			})
		);
		
		result.build = config.build || mutator_eventBuild(result);
		result.build.args = config.args;
		
		return result;
	};
});
