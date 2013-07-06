define('flash/system/Security', [
	'shared/apply',
	'util/as3/inherit'
], function(
	apply,
	__inherit
) {
	function empty() {
		// Empty function used for stubs
	}
	
	function System() {
		// Nothing
	}
	
	// Static constants properties
	// Those are done separately for constant folder's sake
	apply(System, {
		APPLICATION: 'application',
		LOCAL_TRUSTED: 'localTrusted',
 	 	LOCAL_WITH_FILE: 'localWithFile',
 	 	LOCAL_WITH_NETWORK: 'localWithNetwork',
 	 	REMOTE: 'remote'
	});
	
	// Static properties
	apply(System, {
	 	exactSettings: true,
 		pageDomain: undefined,
	 	sandboxType: System.LOCAL_TRUSTED
	});
	
	// Static functions
	apply(System, {
	 	allowDomain: empty,
	 	allowInsecureDomain: empty,
	 	loadPolicyFile: empty,
	 	showSettings: empty
	});
	
	return __inherit(System, Object);
});
