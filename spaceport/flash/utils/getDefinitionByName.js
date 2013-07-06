define('flash/utils/getDefinitionByName', [
	'domain/mainDomain',
	'util/as3/makeFQN'
], function(
	mainDomain,
	makeFQN
) {
	return function getDefinitionByName(name) {
		var classObject = mainDomain.getClass(makeFQN(String(name)));

		// FIXME Not sure if this is the proper error message
		if(!classObject)
			throw new ReferenceError("No public definition exists with the specified name.");
		
		return classObject;
	};
});
