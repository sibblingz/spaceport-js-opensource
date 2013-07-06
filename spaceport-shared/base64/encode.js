define('shared/base64/encode', [
	'shared/utf8/encode',
	'shared/base64/charset',
	'shared/fromCharCode'
], function(
	utf8_encode,
	__base64_charset,
	fromCharCode
) {
	/**
	 * Base64 encode of data
	 */
	return function base64_encode(data) {
		if(!data)
			return data;

		// String array[] access gives another string, we need the charcode
		if(typeof data === "string") {
			data = utf8_encode(data).split('').map(function(chr) {
				return chr.charCodeAt(0);
			});
		}
		
		var i = 0;
		var buffer = [];
		do {
			var o1 = data[i++];
			var o2 = data[i++];
			var o3 = data[i++];

			var bits = (o1 << 16) | (o2 << 8) | o3;

			var h1 = (bits >> 18) & 0x3F;
			var h2 = (bits >> 12) & 0x3F;
			var h3 = (bits >>  6) & 0x3F;
			var h4 = (bits >>  0) & 0x3F;
			
		    buffer.push(__base64_charset.charAt(h1));
		    buffer.push(__base64_charset.charAt(h2));
		    buffer.push(__base64_charset.charAt(h3));
		    buffer.push(__base64_charset.charAt(h4));
		} while(i < data.length);

		var enc = buffer.join('');
		
		var padding = data.length % 3;
		if(padding === 1)
			return enc.slice(0, -2) + '==';
			
		if(padding === 2)
			return enc.slice(0, -1) + '=';

		return enc;
	}
});
