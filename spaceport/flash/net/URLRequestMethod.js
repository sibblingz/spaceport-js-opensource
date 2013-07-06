define('flash/net/URLRequestMethod', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('URLRequestMethod', {
		GET: 'GET',
		POST: 'POST'
	});
});
