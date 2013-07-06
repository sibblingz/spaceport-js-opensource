define('proxy/create', [
	'proxy/ProxyClass',
	'proxy/instanceProperties',
	'proxy/defineProxyProperty',
	'proxy/defineProxyMethod',
	'proxy/defineProxyReference',
	'proxy/defineShadowProperty',
	'proxy/defineProxyLazyReference',
	'bridge/send',
	'bridge/silence',
	'shared/translateGetSet',
	'util/builtin/slice',
	'shared/apply',
	'shared/default',
	'util/js/nameFunction',
	'util/oop/cast',
	'util/oop/instanceof',
	'util/as3/inherit',
	'util/as3/classToString',
	'util/as3/fqnToClassName'
], function(
	ProxyClass,
	proxyInstanceProperties,
	defineProxyProperty,
	defineProxyMethod,
	defineProxyReference,
	defineShadowProperty,
	defineProxyLazyReference,
	send,
	silence,
	translateGetSet,
	slice,
	apply,
	__default,
	__name_function,
	__cast,
	__instanceof,
	__inherit,
	__class_static_toString,
	fqnToClassName
) {
	/**
	 * Creates a new ProxyClass according to a configuration object
	 */
	function create(fqn, superclass, config) {
		if(typeof superclass !== 'function') {
			config = superclass;
			superclass = ProxyClass;
		}
		
		config = __default(config, {});

		var serializeArgument = config.serializeArgument;
		
		var constructorCallbacks = [];

		// Base constructor used in reference and shadow mode
		function baseConstructor() {
			superclass.shadow.apply(this);
			
			constructorCallbacks.forEach(function(callback) {
				callback(this);
			}, this);

			for(var property in config.references)
				defineProxyReference(this, property, config.references[property]);
			for(var property in config.lazy)
				defineProxyLazyReference(this, property, config.lazy[property]);
			
			var args = arguments;
			silence(function() {
				if(config.constructor)
					config.constructor.apply(this, args);
			}, this);
		};
		
		if(PROFILE)
			baseConstructor = YAHOO.tool.Profiler.instrument(fqn, baseConstructor);

		var name = fqnToClassName(fqn);

		// Final resulting class
		var result = __name_function(name, function(value) {
				// Automatic casting is not needed in the land of untyped
				// If items do not share common prototype, error out
			if(!__instanceof(this, result))
				return __cast(value, result);
			
			baseConstructor.apply(this, arguments);
			
			// FIXME fqn needs to be escaped
			send.apply(null, ['create', null, this, fqn].concat(slice.call(arguments)));
		});
		
		var resultProto = __inherit(result, superclass).prototype;
		
		if(config.methods) {
				// Fake methods - direct copy
			apply(resultProto, translateGetSet(config.methods.fake));
				// Native methods
			for(var methodName in config.methods.real)
				defineProxyMethod(resultProto, methodName, config.methods.real[methodName], serializeArgument);
		}
		
		for(var property in config.properties) {
			var instanceFunction = defineProxyProperty(resultProto, property, config.properties[property], serializeArgument);
			if(instanceFunction)
				constructorCallbacks.push(instanceFunction);
		}

		// Shadow constructor of the class - does not produce a 'create' command
		// as well as creates shadow properties
		var shadow = __name_function(name, function(value) {
				// Automatic casting is not needed in the land of untyped
				// If items do not share common prototype, error out
			if(!__instanceof(this, result))
				return __cast(value, result);
			
			baseConstructor.apply(this, arguments);
			
			for(var property in config.shadow)
				defineShadowProperty(this, property, config.shadow[property], serializeArgument);
		});
		
		shadow.shadow = shadow;
		shadow.superclass = superclass;
		shadow.prototype = resultProto;
		shadow.toString = __class_static_toString;
		
		result.shadow = shadow;

		if(config.patch) {
			result.patch = config.patch;
			shadow.patch = config.patch;
		}

		if(config.build) {
			result.build = config.build;
			shadow.build = config.build;
		}
		
		if(config.alwaysShadow) {
			result = shadow;
			resultProto.constructor = result;
		}
		
		if(DEBUG) {
			// For Spaceport reflection (spaceport-metadata)
			if(config.constructor) {
				result.wrapped = config.constructor;
				result.shadow.wrapped = config.constructor;
			}
		}

		return result;
	}

	return create;
});
