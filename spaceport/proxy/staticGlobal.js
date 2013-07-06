define('proxy/staticGlobal', [
	'spid',
	'proxy/ProxyClass',
	'util/builtin/objectCreate'
], function(
    SPID,
    ProxyClass,
    objectCreate
) {
	// Create a ProxyClass without using the global ID dispatcher.
	var staticGlobal = objectCreate(ProxyClass.prototype);
	
	// We need an ID of 0 to assign global
	staticGlobal[SPID] = 0;
	
	return staticGlobal;
});
