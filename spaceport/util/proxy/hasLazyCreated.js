define('util/proxy/hasLazyCreated', [
	'spid',
	'proxy/createdLazies'
], function(
	SPID,
	createdLazies
) {
	return function hasLazyCreated(instance, name) {
		return Boolean(createdLazies[instance[SPID]]) && createdLazies[instance[SPID]][name];
	};
});
