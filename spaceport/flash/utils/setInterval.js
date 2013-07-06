define('flash/utils/setInterval', [
	'util/as3/timerWrapClosure'
], function(
	timerWrapClosure
) {
	return timerWrapClosure(setInterval);
});
