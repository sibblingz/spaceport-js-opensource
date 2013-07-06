define('util/oop/inherit', [
	'shared/apply',
	'util/builtin/objectCreate'
], function(
	apply,
	objectCreate
) {
	/**
	 * Plain prototypal inheritance
	 */
	return function __inherit(to, from, extend) {
		return apply(to, {
			prototype: apply(objectCreate(from.prototype), apply({
				constructor: to
			}, extend))
		});
	};
});
