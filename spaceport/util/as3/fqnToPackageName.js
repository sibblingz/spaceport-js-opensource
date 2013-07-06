define('util/as3/fqnToPackageName', [], function() {
	return function fqnToPackageName(name) {
		return name.split('::')[0];
	};
});
