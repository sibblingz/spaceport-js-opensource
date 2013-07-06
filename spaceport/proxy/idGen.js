define('proxy/idGen', [], function() {
	var lastId = 0;

	/**
	 * ID Dispatcher for Proxy instances
	 */
	return function proxyIdGen() {
		return lastId += 1;
	};
});
