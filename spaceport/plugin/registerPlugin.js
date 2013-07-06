define('plugin/registerPlugin', [
	'plugin/pluginDomain',
	'plugin/PluginCreator',
	'util/caps/capsOf',
	'util/proxy/shadowProperty',
	'util/proxy/shadowResult',
	'shared/defineGetter',
	'shared/defineSetter',
	'shared/defineReadOnly',
	'shared/objectKeys',
	'bridge/send',
	'bridge/escape'
], function(
	pluginDomain,
	PluginCreator,
	capsOf,
	shadowProperty,
	shadowResult,	
	defineGetter,
	defineSetter,
	defineReadOnly,
	objectKeys,
	bridgeSend,
	bridgeEscape
) {
	return function registerPlugin(generator) {
		var exports = {};
		generator(new PluginCreator(exports), {
			send: bridgeSend,
			escape: bridgeEscape,
			
			defineGetter: defineGetter,
			defineSetter: defineSetter,
			defineReadOnly: defineReadOnly,

			capsOf: capsOf,
			
			shadowResult: shadowResult,
			shadowProperty: shadowProperty
		});
		
		objectKeys(exports).forEach(function(fqn) {
			pluginDomain.classes[fqn] = exports[fqn];
		});
	};
});
