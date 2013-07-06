define('shared/utf8/encode', [
	'shared/fromCharCode'
], function(
	fromCharCode
) {
	/**
	 * Encodes a UTF8 string to JS
	 */
	return function utf8_encode(string) {
		if(string == null)
		    return '';

		string = String(string);
		
		var utftext = '';
		var start = 0;
		var end = 0;
		for(var i=0; i<string.length; ++i) {
		    var c1 = string.charCodeAt(i);
		    var enc = null;

		    if(c1 < 128)
		        end++;
		    else if(c1 > 127 && c1 < 2048)
		        enc = fromCharCode((c1 >>  6) | 0xC0, ((c1 >> 0) & 0x3F) | 0x80);
		    else
		        enc = fromCharCode((c1 >> 12) | 0xE0, ((c1 >> 6) & 0x3F) | 0x80, (c1 & 0x3F) | 0x80);

		    if(enc !== null) {
		        if(end > start)
		            utftext += string.slice(start, end);

		        utftext += enc;
		        start = end = i + 1;
		    }
		}
		
		if(end > start)
		    utftext += string.slice(start, string.length);
		
		return utftext;
	};
});
