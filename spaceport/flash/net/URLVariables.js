define('flash/net/URLVariables', [
	'shared/default',
	'shared/hasProperty',
	'util/builtin/isArray',
	'util/as3/inherit'
], function(
	__default,
	hasProperty,
	isArray,
	__inherit
) {
	function URLVariables(source) {
		this.decode(__default(source, ''));
	};
	
	return __inherit(URLVariables, Object, {
		'decode': function decode(source) {
			var self = this;
			source.split(/&/g).forEach(function(part) {
				if(!part)
					return;

					// If we have x=y=z, key is x and value is y=z
				var pair = part.split(/=/);
				if(pair.length < 2)
					throw new Error('The String passed to URLVariables.decode() must be a URL-encoded query string containing name/value pairs.');

				var key = pair[0];
				if(self[key])
					self[key] = [].concat(self[key], unescape(pair[1]));
				else
					self[key] = unescape(pair[1]);
			});
		},
		'toString': function toString() {
			var values = [];
			for(var key in this) {
				if(!hasProperty(this, key))
					continue;
				
				var value = this[key];
				var escapedKey = escape(key);
				if(isArray(value)) {
					value.forEach(function(value) {
						values.push([escapedKey, escape(value)].join('='));
					});
				} else
					values.push([escapedKey, escape(value)].join('='));
			}
			
			return values.join('&');
		}
	});
});
