define('bridge/unsend', [
	'shared/internalError',
	'bridge/buffer'
], function(
	internalError,
	buffer
) {
	return function unsend(command) {
		var index = buffer.indexOf(command);
		if(index < 0) {
			internalError(2421);
		}

		// FIXME This does not use bufferOptimizer's removeCommand (but it should)
		buffer.splice(index, 1);
	};
});
