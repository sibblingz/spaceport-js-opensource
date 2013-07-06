define('flash/errors/EOFError', [
	'util/as3/createError',
	'flash/errors/IOError'
], function(
	__createError,
	IOError
) {
	return __createError('EOFError', IOError);
});
