define('util/as3/makeFQN', [
	'util/as3/fqnToDefinitionName',
	'util/as3/definitionNameToFQN'
], function(
	fqnToDefinitionName,
	definitionNameToFQN
) {
	return function makeFQN(name) {
		name = definitionNameToFQN(fqnToDefinitionName(name));
		if(!/::/.test(name)) {
			name = '::' + name;
		}
		return name;
	};
});
