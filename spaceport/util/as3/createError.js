define('util/as3/createError', [
	'shared/apply',
	'util/as3/makeClassToString',
	'shared/default',
	'util/oop/inherit'
], function(
	apply,
	makeClassToString,
	__default,
	__js_inherit
) {
	return function createError(name, superclass) {
		function result(message) {
			if(message)
				this.message = String(message);
		}
		
		return apply(__js_inherit(result, superclass || Error, {
			name: name
		}), {
			toString: makeClassToString(name)
		});
	}
});
