define('util/as3/definitionNameToFQN', [], function() {
	return function definitionNameToFQN(name) {
		return name.replace(/^(.*)\.([^.]*)$/, '$1::$2');
	};
});
