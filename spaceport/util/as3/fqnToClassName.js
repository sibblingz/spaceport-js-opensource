define('util/as3/fqnToClassName', [], function() {
	return function fqnToClassName(name) {
		return String(name.split('::').slice(-1)).replace(/-/g, '');
	};
});
