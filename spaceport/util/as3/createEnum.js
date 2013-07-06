define('util/as3/createEnum', [
	'sp/Class'
], function(
	Class
) {
	/**
	 * AS3's default Class.prototype.toString
	 */
	return function createEnum(name, map) {
		return Class.create(name, {
			statics: map
		});
	};
});
