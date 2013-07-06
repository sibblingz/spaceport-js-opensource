define('util/translateArgument', [
	'proxy/ISpaceportSerializable',
	'util/oop/instanceof',
	'util/builtin/isArray'
], function(
	ISpaceportSerializable,
	__instanceof,
	isArray
) {
	/**
	 * Translate an argument to spaceport native serialize
	 */
	return function translateArgument(argument, serialize) {
		if(__instanceof(argument, ISpaceportSerializable))
			return argument.nativeSerialize();
		else if(isArray(argument))
			return 'c:Array(' + argument.map(translateArgument) + ')';
		else if(typeof serialize === 'function')
			return serialize(argument);
		else
			return argument;
	};
});
