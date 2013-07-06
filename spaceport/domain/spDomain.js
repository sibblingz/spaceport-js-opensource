define('domain/spDomain', [
	'domain/flashDomain',
	'domain/Domain',
	'util/as3/fqnToClassName',
	'shared/objectKeys'
], function(
	flashDomain,
	Domain,
	fqnToClassName,
	objectKeys
) {
    // spDomain is flashDomain with only the class names as fqn's.  It's a
    // hack, but allows for fast lookup from native patches.
    var spDomain = new Domain('sp');
    var classes = flashDomain.classes;
    objectKeys(classes).forEach(function(fqn) {
        spDomain.classes[fqnToClassName(fqn)] = classes[fqn];
    });
    return spDomain;
});
