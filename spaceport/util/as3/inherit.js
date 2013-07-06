define('util/as3/inherit', [
	'shared/apply',
	'util/oop/inherit',
	'util/as3/toString',
	'util/as3/classToString'
], function(
	apply,
	__js_inherit,
	__class_prototype_toString,
	__class_static_toString
) {
	/**
	 * AS3 inheritance
	 */
	return function __inherit(to, from, extend) {
		return apply(__js_inherit(to, from, apply({
			toString: __class_prototype_toString
		}, extend)), {
			superclass: from,
			toString: __class_static_toString
		});
	};
});
