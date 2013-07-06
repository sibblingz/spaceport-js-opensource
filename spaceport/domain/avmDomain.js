define('domain/avmDomain', [
	'domain/AggregateDomain'
], function(
	AggregateDomain
) {
	return new AggregateDomain('avm');
});
