define('sp/Dictionary', [
	'shared/defineNonEnumerable',
	'util/as3/inherit'
], function(
	defineNonEnumerable,
	__inherit
) {
	function Dictionary() {
		defineNonEnumerable(this, '__keys__', []);
		defineNonEnumerable(this, '__values__', []);
	}
	return __inherit(Dictionary, Object, {});
});
