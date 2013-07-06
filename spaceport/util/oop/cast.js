define('util/oop/cast', [
	'util/error/coercionFailed',
	'flash/utils/getQualifiedClassName',
	'util/as3/fqnToDefinitionName',
	'util/oop/instanceof'
], function(
	coercionFailed,
	getQualifiedClassName,
	fqnToDefinitionName,
	__instanceof
) {
	/**
	 * AS3 style 'cast'.
	 * will return from if the same instance of to otherwise throw an error since the cast failed
	 */
	return function __cast(from, to) {
		if(__instanceof(Object(from), to))
			return from;
		
		throw coercionFailed(from, fqnToDefinitionName(getQualifiedClassName(to)));
	};
});
