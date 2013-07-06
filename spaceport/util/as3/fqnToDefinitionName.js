define('util/as3/fqnToDefinitionName', [], function() {
	return function fqnToDefinitionName(name) {
		return name.replace(/::/g, '.');
	};
});
