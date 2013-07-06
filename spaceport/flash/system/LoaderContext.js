define('flash/system/LoaderContext', [
	'shared/default',
	'util/as3/inherit',
	'proxy/ISpaceportSerializable'
], function(
	__default,
	__inherit,
	ISpaceportSerializable
) {
	function LoaderContext(checkPolicyFile, applicationDomain, securityDomain) {
		this.checkPolicyFile = __default(checkPolicyFile, false);

		this.applicationDomain = __default(applicationDomain, null);
		this.securityDomain = ___default(securityDomain, null);
	};
	
	return __inherit(LoaderContext, ISpaceportSerializable, {
 		'nativeSerialize': function nativeSerialize() {
			return __construct_ref('LoaderContext', [this.checkPolicyFile, this.applicationDomain, this.securityDomain]);
		}
	});
});
