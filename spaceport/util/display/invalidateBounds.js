define('util/display/invalidateBounds', [
	'util/display/displayBounds',
	'spid'
], function(
	displayBounds,
	SPID
) {
	return function invalidateBounds(instance) {
		var parent = instance;
		while(parent) {
			delete displayBounds[parent[SPID]];
			parent = parent.parent;
		}
	};
});
