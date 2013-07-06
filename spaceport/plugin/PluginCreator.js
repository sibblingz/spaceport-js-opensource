define('plugin/PluginCreator', [
	'plugin/pluginDomain',
	'domain/Domain',
	'proxy/create',
	'shared/default',
	'shared/objectKeys',
	'flash/events/Event',
	'util/as3/eventBuilder',
	'util/as3/fqnToClassName',
	'shared/defineGetter',
	'shared/defineSetter',
	'shared/defineReadOnly',
	'util/as3/createEnum',
	'sp/Class',
	'proxy/ProxyClass',
	'util/oop/inherit'
], function(
	pluginDomain,
	Domain,
	proxyCreate,
	__default,
	objectKeys,
	Event,
	eventBuilder,
	fqnToClassName,
	defineGetter,
	defineSetter,
	defineReadOnly,
	__create_enum,
	Class,
	ProxyClass,
	__js_inherit
) {
	function translate(config) {
		var translated = {};
		
		// Shared
		translated.c = config.constructor;
		translated.o = config.methods;
		if(translated.o) {
			translated.o.l = config.methods.fake;
			translated.o.k = config.methods.real;
		}
		
		// Events
		translated.a = config.args;
		translated.e = config.events;
		
		// Proxy
		translated.n = config.properties;
		translated.g = config.patch;
		translated.i = config.build;
		
		return translated;
	}
	
	function defaultSuperclass(config, superclass) {
		return (config && config.superclass) || superclass;
	}
	
	function PluginCreator(output) {
		defineReadOnly(this, 'classes', output);
	}
	
	return __js_inherit(PluginCreator, Object, {
		registerClass: function registerClass(fqn, cls) {
			return (this.classes[fqn] = cls);
		},
		createClass: function createClass(fqn, config) {
			return this.registerClass(fqn, Class.create(fqn, defaultSuperclass(config, Object), config));
		},
		createEnum: function createEnum(fqn, statics) {
			return this.registerClass(fqn, __create_enum(fqn, statics));
		},
		createProxy: function createProxy(fqn, config) {
			return this.registerClass(fqn, proxyCreate(fqn, defaultSuperclass(config, ProxyClass), translate(config)));
		},
		createEvent: function createEvent(fqn, config) {
			return this.registerClass(fqn, eventBuilder(fqn, defaultSuperclass(config, Event), translate(config)));
		}
	});
});
