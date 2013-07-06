define('flash/system/SecurityDomain', [
	'shared/apply',
	'shared/default',
	'util/as3/inherit',
	'util/builtin/objectCreate',
	'proxy/ISpaceportSerializable'
], function(
	apply,
	__default,
	__inherit,
	objectCreate,
	ISpaceportSerializable
) {
	function SecurityDomain() {
		throw new Error('ArgumentError: SecurityDomain class cannot be instantiated');
	};
	
	apply(SecurityDomain, {
		currentDomain: apply(objectCreate(SecurityDomain.prototype), {
			name: 'current'
		})
	});
	
	return __inherit(SecurityDomain, ISpaceportSerializable, {
 		'nativeSerialize': function nativeSerialize() {
			return __construct_ref('SecurityDomain', [this.name]);
		}
	});
});
