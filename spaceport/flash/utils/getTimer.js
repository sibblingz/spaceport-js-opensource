define('flash/utils/getTimer', [], function() {
	var startTime = Date.now();
	
	return function getTimer() {
		return Date.now() - startTime;
	};
});
