define('bridge/escape', [], function() {
	return function bufferEscape(string) {
		return encodeURI(string).replace(/[\(\)\!\*\,]/g, escape);
	};
});
