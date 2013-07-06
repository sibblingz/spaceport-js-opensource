define('flash/net/sendToURL', [
    'bridge/sendStatic'
], function(
    sendStatic
) {
	return function sendToURL(req) {
        sendStatic('sendToURL', req);
	};
});
