define('flash/system/Capabilities', [
	'shared/apply',
	'util/as3/inherit',
	'util/caps/capsOf'
], function(
	apply,
	__inherit,
	capsOf
) {
	function Capabilties() {
		// Nothing
	}
	
	var caps = (function() {
		var caps;
		return function() {
			if(!caps)
				caps = capsOf(Capabilties);
			
			return caps;
		};
	})();
	
	// Static properties
	apply(Capabilties, {
	 	get screenDPI() {
			return caps().screenDPI;
		},
		get pixelAspectRatio() {
			return caps().pixelAspectRatio;
		}
	});
	
	return __inherit(Capabilties, Object);
});
