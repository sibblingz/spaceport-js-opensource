define('shared/utf8/decode', [
	'shared/fromCharCode'
], function(
	fromCharCode
) {
	/**
	 * Decodes a JS string to UTF8
	 */
	return function utf8_decode(string) {
		if(!string)
			return '';
		
		var result = [];

		string = String(string);
		
		var i = 0;
		while(i < string.length) {
			var c1 = string.charCodeAt(i);

			if(c1 < 128) {
				result.push(fromCharCode(c1));
				i += 1;
			} else if (c1 > 191 && c1 < 224) {
				var c2 = string.charCodeAt(i + 1);
				result.push(fromCharCode(((c1 & 31) << 6) | (c2 & 63)));
				i += 2;
			} else {
				var c2 = string.charCodeAt(i + 1);
				var c3 = string.charCodeAt(i + 2);
				result.push(fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
				i += 3;
			}
		}

		return result.join('');
	};
});

