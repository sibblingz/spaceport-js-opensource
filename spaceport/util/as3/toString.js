define('util/as3/toString', [
	'util/oop/className'
], function(
	__class_name
) {
	/**
	 * AS3's default Object.prototype.toString
	 */
	return function __class_prototype_toString() {
		return '[object ' + __class_name(this) + ']';
	};
});
