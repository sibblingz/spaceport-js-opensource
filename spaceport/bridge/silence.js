define('bridge/silence', [
	'bridge/buffer'
], function(
	bridgeBuffer
) {
	function silence(block, scope) {
		var wasSilenced = silence.isSilenced;
		silence.isSilenced = true;
		
		block.call(scope);
		
		silence.isSilenced = wasSilenced;
	}

	silence.isSilenced = false;

	return silence;
});
