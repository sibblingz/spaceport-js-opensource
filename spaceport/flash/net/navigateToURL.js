define('flash/net/navigateToURL', [
    'bridge/sendStatic'
], function(
    sendStatic
) {
	return function navigateToURL(req) {
        sendStatic('navigateToURL', req);
	};
});
