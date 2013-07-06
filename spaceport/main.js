/**
 * Spaceport Javascript client
 */
	// Require.JS support
define('main', [
	'sp',
	'bridge'
], function(
	sp,
	bridge
) {
	var global = (function() { return this; }());

	// Browser support
	global.sp = sp;
	
	// Node.JS support
	// (needed for minfied version)
	if(typeof module !== 'undefined') {
		module.exports = sp;
	}
	
	// Communication bridge	
	sp.bridge = bridge;
	
	return sp;
});
