define('flash/net/URLLoaderDataFormat', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('URLLoaderDataFormat', {
		BINARY: 'binary',
		TEXT: 'text',
		VARIABLES: 'variables'
	});
});
