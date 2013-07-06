define('sp/Class', [
	'shared/default',
	'shared/hasProperty',
	'spmetadata',
	'sp/preconstructInstance',
	'util/nameFunctions',
	'util/as3/inherit',
	'util/builtin/functionPrototype',
	'shared/objectKeys',
	'shared/translateGetSet',
	'util/js/nameFunction',
	'shared/apply',
	'shared/applyVariadic',
	'util/oop/instanceof',
	'util/oop/cast',
	'util/oop/getPrototypeOf',
	'shared/lookupGetter',
	'shared/lookupSetter',
	'domain/userDomain',
	'sp/toInt',
	'sp/toUint',
	'util/stringSimilarity',
	'util/error/coercionFailed',
	'util/oop/isClass',
	'util/as3/makeClassToString',
	'util/as3/makeFQN',
	'util/as3/fqnToClassName'
], function(
	__default,
	hasProperty,
	SPMETADATA,
	preconstructInstance,
	nameFunctions,
	__inherit,
	funcProto,
	objectKeys,
	translateGetSet,
	__name_function,
	apply,
	applyVariadic,
	__instanceof,
	__cast,
	getPrototypeOf,
	lookupGetter,
	lookupSetter,
	userDomain,
	toInt,
	toUint,
	stringSimilarity,
	coercionFailed,
	isClass,
	makeClassToString,
	makeFQN,
	fqnToClassName
) {
	var validMembers = [
		'preconstruct', 'constructor',
		'implements',
		'methods', 'prebound',
		'properties', 'propertyTypes',
		'statics', 'staticTypes'
	];

	function defaultValue(type) {
		// Rules taken from implicitCoerce.
		// This is the same as sp.implicitCoerce(undefined, type)
		switch(type) {
			case toInt:
			case toUint:
			case Number:
			case Boolean:
				return type(undefined);
			default:
				return null;
		}
	}

	// TODO Coercion on assignment
	function defaultValues(obj) {
		var out = {};
		for(var key in obj) {
			out[key] = defaultValue(obj[key]);
		}
		return out;
	}

	return apply(function Class(value) {
		if(__instanceof(this, Class)) {
			throw new TypeError("Cannot create an instance of Class");
		} else if(value == null) { // Fuzzy
			return null;
		} else if(isClass(value)) {
			return value;
		} else {
			throw coercionFailed(value, "Class");
		}
	}, {
		'toString': makeClassToString('Class'),

		'create': function create(className, superclass, config) {
			if(CUSTOMER_DEBUG) {
				if(this instanceof create) {
					throw new TypeError("Do not use 'new' with sp.Class.create");
				}

				if(typeof className !== 'string') {
					throw new TypeError("First argument to sp.Class.create must be a string");
				}
			}

				// No valid superclass given, inherit from Object
			if(typeof superclass !== 'function') {
				if(CUSTOMER_DEBUG) {
					if(config) {
						throw new TypeError("Superclass of " + className + " must be a function");
					}
				}

				config = superclass;
				superclass = Object;
			}
			
			config = __default(config, {});
			var fqn = makeFQN(className);
			
			if(CUSTOMER_DEBUG) {
				objectKeys(config).forEach(function(key) {
					if(validMembers.indexOf(key) < 0) {
						// Invalid member; try and guess what the user meant
						var relevances = validMembers.map(stringSimilarity.bind(null, key));
						var guessedName = null;
						for(var i=0; i<relevances.length; ++i) {
							if(relevances[i] > key.length / 2) {
								guessedName = validMembers[i];
							}
						}
						throw new TypeError(
							"Unknown class descriptor type: " + key +
							(guessedName ? " (did you mean " + guessedName + "?)" : "")
						);
					}
				});
			}

			var properties = __default(config.properties, {});
			var prebound = __default(config.prebound, {});
			var methods = __default(config.methods, {});
			var statics = __default(config.statics, {});
			var constructor = hasProperty(config, 'constructor') && config.constructor || superclass;
			var preconstruct = __default(config.preconstruct);
			var propertyTypes = __default(config.propertyTypes, {});
			var staticTypes = __default(config.staticTypes, {});
			var implements_ = __default(config['implements']);

			var name = fqnToClassName(fqn);
			var result = __name_function(name, function(value) {
					// Coersion
				if(!__instanceof(this, result))
					return __cast(value, result);
				
				var proto = result.prototype;
				if(getPrototypeOf(this) === proto) {
					// Preconstruct *once* per instance
					preconstructInstance(this);
				}

				for(var preboundMethodName in prebound) {
					if(!hasProperty(this, preboundMethodName)) {
						this[preboundMethodName] = funcProto.bind.call(prebound[preboundMethodName], this);
					}
				}
				
					// Constructor given by user
				constructor.apply(this, arguments);
			});
			

				// Methods and properties
			__inherit(result, superclass, applyVariadic({},
				translateGetSet(methods), prebound,
				defaultValues(propertyTypes), properties
			));
			
				// Static properties and methods
			result = applyVariadic(result,
				defaultValues(staticTypes),
				translateGetSet(statics)
			);

			// Metadata
			result[SPMETADATA] = {
				'implements': implements_ ? implements_.slice() : [],
				'preconstruct': preconstruct,
				'superclass': superclass
			};

			nameFunctions(result, fqn + '.');
			nameFunctions(result.prototype, fqn + '.');

			if(/\.|::/.test(className))
				userDomain.classes[fqn] = result;

			return result;
		}
	});
});
