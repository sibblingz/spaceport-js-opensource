define('shared/base64/decodeToString', [
	'shared/utf8/decode',
	'shared/base64/charset',
	'shared/fromCharCode'
], function(
	utf8_decode,
	__base64_charset,
	fromCharCode
) {
	return function base64_decode_string(data) {
		var result = [];

		if(!data)
		    return data;

		data = String(data);
		
		var i = 0;
		do {
			var h1 = __base64_charset.indexOf(data[i++]);
			var h2 = __base64_charset.indexOf(data[i++]);
			var h3 = __base64_charset.indexOf(data[i++]);
			var h4 = __base64_charset.indexOf(data[i++]);

		    var bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;

		    var o1 = (bits >> 16) & 0xFF;
		    var o2 = (bits >>  8) & 0xFF;
		    var o3 = (bits >>  0) & 0xFF;

		    if(h3 == 64)
		        result.push(fromCharCode(o1));
		    else if(h4 == 64)
		        result.push(fromCharCode(o1, o2));
		    else
		        result.push(fromCharCode(o1, o2, o3));
		} while(i < data.length);

		return utf8_decode(result.join(''));
	}
});
