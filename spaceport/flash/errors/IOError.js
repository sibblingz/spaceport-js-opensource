define('flash/errors/IOError', [
	'util/as3/createError'
], function(
	__createError
) {
	return __createError('IOError', Error);
});
