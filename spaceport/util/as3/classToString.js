define('util/as3/classToString', [
	'util/oop/className'
], function(
	__class_name
) {
	/**
	 * AS3's default Class.prototype.toString
	 */
	return function __class_static_toString() {
		return '[class ' + this.name + ']';
	};
});
