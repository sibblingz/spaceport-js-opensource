define('domain/mainDomain', [
	'domain/AggregateDomain'
], function(
	AggregateDomain
) {
	// Domains are added in sp.js to work around circular dependencies.
	return new AggregateDomain('spaceport');
});
