define('util/nextTick', [], function() {
	return function nextTick(callback, context) {
		setTimeout(function() {
			callback.call(context);
		}, 100);
	};
});
