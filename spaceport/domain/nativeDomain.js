define('domain/nativeDomain', [
	'domain/AggregateDomain',
	'domain/spDomain',
	'domain/flashDomain',
	'plugin/pluginDomain'
], function(
	AggregateDomain,
	spDomain,
	flashDomain,
	pluginDomain
) {
    // This is the domain used for looking up
    // native type identifiers ('$' key).
    var nativeDomain = new AggregateDomain('native');
    nativeDomain.addDomain(pluginDomain);
    nativeDomain.addDomain(flashDomain);
    nativeDomain.addDomain(spDomain);
    return nativeDomain;
});
