define('sp/typeOf', [
	'e4x/XML',
	'e4x/XMLList',
	'util/builtin/objectToString',
	'util/oop/isClass',
	'util/oop/instanceof'
], function(
	XML,
	XMLList,
	objectToString,
	isClass,
	__instanceof
) {
	return function typeOf(x) {
		if(__instanceof(x, XML) || __instanceof(x, XMLList)) {
			return 'xml';
		} else if(typeof x === 'undefined') {
			return 'undefined';
		} else if(isClass(x)) {
			return 'object';
		} else {
			switch(objectToString.call(x)) {
				case '[object String]': return 'string';
				case '[object Number]': return 'number';
				case '[object Boolean]': return 'boolean';
				case '[object Function]': return 'function';
				default: return 'object';
			}
		}
	};
});
