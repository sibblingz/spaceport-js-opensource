define('flash/utils/setTimeout', [
	'util/as3/timerWrapClosure'
], function(
	timerWrapClosure
) {
	return timerWrapClosure(setTimeout);
});
