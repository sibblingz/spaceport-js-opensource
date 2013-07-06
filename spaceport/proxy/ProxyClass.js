define('proxy/ProxyClass', [
	'shared/hasProperty',
	'proxy/idGen',
	'proxy/instanceProperties',
	'proxy/createdLazies',
	'bridge/send',
	'bridge/dictionary',
	'proxy/ISpaceportSerializable',
	'shared/defineReadOnly',
	'util/as3/inherit',
	'spid'
], function(
	hasProperty,
	proxyIdGen,
	proxyInstanceProperties,
	createdLazies,
	send,
	dictionary,
	ISpaceportSerializable,
	defineReadOnly,
	__inherit,
	SPID
) {
	function ProxyClass() {
		// If already has an ID, don't trump
		if(hasProperty(this, SPID))
			return;
		
		var id = proxyIdGen();

		this[SPID] = id;
		proxyInstanceProperties[id] = {};
	}

	ProxyClass.shadow = ProxyClass;
	return __inherit(ProxyClass, ISpaceportSerializable, {
		'destroy': function destroy(deep) {
			var id = this[SPID];
 			delete proxyInstanceProperties[id];
 			delete createdLazies[id];

			if(dictionary[id]) {
				delete dictionary[id];

				send('destroy', null, null, id);
			}
		},
		'nativeSerialize': function nativeSerialize() {
			return 'r:' + this[SPID];
		}
	});
});
