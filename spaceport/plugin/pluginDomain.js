define('plugin/pluginDomain', [
	'domain/Domain'
], function(
	Domain
) {
    return new Domain('plugins');
});
