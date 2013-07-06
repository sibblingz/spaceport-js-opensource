define('sp/import', [
	'domain/mainDomain',
	'util/as3/definitionNameToFQN',
	'util/as3/fqnToClassName',
	'util/as3/fqnToPackageName'
], function(
	mainDomain,
	definitionNameToFQN,
	fqnToClassName,
	fqnToPackageName
) {
	// TODO Make this public under a nice (Safari-friendly) name
	return function _import(name) {
		var fqn = definitionNameToFQN(String(name));
		var className = fqnToClassName(fqn);
		if(className === '*') {
			return mainDomain.getPackage(fqnToPackageName(fqn));
		} else {
			return mainDomain.getClass(fqn);
		}
	};
});
