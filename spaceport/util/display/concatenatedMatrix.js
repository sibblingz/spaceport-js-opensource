define('util/display/concatenatedMatrix', [
	'util/display/displayMatrices',
	'spid'
], function(
	displayMatrixes,
	SPID
) {
	return function concatenatedMatrix(displayObject) {
		var matrix = displayMatrixes[displayObject[SPID]].clone();
		
		var parent = displayObject;
		while(parent = parent.parent)
			matrix.concat(displayMatrixes[parent[SPID]]);
			
		return matrix;
	};
});
