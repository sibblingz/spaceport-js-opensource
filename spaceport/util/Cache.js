define('util/Cache', [
	'util/oop/inherit'
], function(
	__js_inherit
) {
	// TODO: More efficient version using WeakMap where supported

	var CACHE_SIZE = 30;

	return __js_inherit(function Cache() {
		this.keys = [];
		this.values = [];
	}, Object, {
		// Collects old items from the cache and discards them.
		'collect': function collect() {
			var len = this.keys.length;
			var start = len - CACHE_SIZE;
			this.keys.splice(start, len);
			this.values.splice(start, len);
		},

		// Gets an item from the cache by key.
		// If getting fails, `null` is returned.
		'get': function get(key) {
			var index = this.keys.indexOf(key);
			return index >= 0 ? this.values[index] : null;
		},

		// Unsafely sets an item in the cache.  Does *not* override existing
		// values!
		'setU': function setU(key, value) {
			this.keys.push(key);
			this.values.push(value);
		}
	});
});
