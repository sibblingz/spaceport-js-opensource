define('flash/net/SharedObject', [
	'bridge/send',
	'shared/base64/encode',
	'shared/base64/decodeToString',
	'shared/apply',
	'shared/defineNonEnumerable',
	'util/caps/capsOf',
	'util/as3/inherit',
	'util/builtin/json/parse',
	'util/builtin/json/stringify'
], function(
	send,
	base64Encode,
	base64DecodeToString,
	apply,
	defineNonEnumerable,
	capsOf,
	__inherit,
	jsonParse,
	jsonStringify
) {
	/** Persistant storage of JSON objects.
	 *
	 * .. warning::
	 *
	 *    :func:`~sp.SharedObject.flush` **must** be called for data to be
	 *    saved.  Data is not saved automatically.
	 */
	function SharedObject(name) {
		defineNonEnumerable(this, 'name', name);
	}
	
	apply(SharedObject, {
		'getLocal': function getLocal(name) {
			return new SharedObject(name);
		}
	});
	
	return __inherit(SharedObject, Object, {
		/** The data to save when :func:`~sp.SharedObject.flush` is called.
		 *
		 * The ``data`` property is an object and cannot be reassigned.
		 * Instead, to change data, manipulate the keys of the ``data``
		 * property.
		 *
		 * Multiple SharedObject instances with the same
		 * :attr:`~sp.SharedObject.name` will have the ``data`` property refer
		 * to the same object.
		 */
		get data() {
			var name = this.name;
			var caps = capsOf(SharedObject);
			
			if(typeof caps[name] === 'string')
				caps[name] = jsonParse(base64DecodeToString(caps[name]));
			if(!caps[name])
				caps[name] = {};
			
			return caps[name];
		},

		/** Clears then flushes the SharedObject.
		 *
		 * A new ``data`` object created.  References to the old value of
		 * :attr:`~sp.SharedObject.data` will *not* equal the new value of
		 * :attr:`~sp.SharedObject.data` after calling this function.
		 */
		'clear': function clear() {
			// Erase the key
			capsOf(SharedObject)[this.name] = {};
			
			this.flush();
		},

		/** Flushes the SharedObject's data to persistent memory.
		 *
		 * Data is ensured to be saved after *two* :attr:`~sp.Event.ENTER_FRAME`
		 * events.
		 *
		 * The :attr:`~sp.SharedObject.data` property is serialized using
		 * :func:`JSON.stringify`.  You can override serialization behaviour by
		 * implementing a :func:`toJSON` method of objects being serialized.
		 *
		 * It is recommended you call this method relatively infrequently, as
		 * saving may stall the game temporary.
		 */
		'flush': function flush() {
			var name = this.name;
			var caps = capsOf(SharedObject);
			
			send('save', null, null, name, base64Encode(jsonStringify(caps[name])));
		}
	});
});
