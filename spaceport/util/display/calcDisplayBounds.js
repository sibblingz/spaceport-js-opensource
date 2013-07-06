define('util/display/calcDisplayBounds', [
	'util/display/calcBounds',
	'util/display/displayMatrices',
	'util/display/displayBounds',
	'spid'
], function(
	helper_calcBounds,
	displayMatrixes,
	displayBounds,
	SPID
) {
	return function helper_calcDisplayBounds(instance) {
		var id = instance[SPID];

		if(!displayBounds[id])
			displayBounds[id] = helper_calcBounds(instance.getBounds(instance), displayMatrixes[id]);

		return displayBounds[id];
	};
});
