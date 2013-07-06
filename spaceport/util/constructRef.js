define('util/constructRef', [
	'util/translateArgument'
], function(
	translateArgument
) {
	/**
	 * A helper to get a serialized version of a spaceport construct reference
	 */
	return function __construct_ref(name, args) {
		return 'c:' + name + '(' + [].concat(args).map(translateArgument) + ')';
	};
});
