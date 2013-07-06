define('util/display/getBounds', [
	'flash/geom/Matrix',
	'util/display/displayMatrices',
	'util/display/calcBounds',
	'spid'
], function(
	Matrix,
	displayMatrixes,
	helper_calcBounds,
	SPID
) {
	function helper_ancestorPath(a) {
		var path = [];
		while(a) {
			path.unshift(a);
			a = a.parent;
		}

		return path;
	}

	function helper_commonAncestorPaths(a, b) {
		var aPath = helper_ancestorPath(a);
		var bPath = helper_ancestorPath(b);
		for(var i=0; i<aPath.length&&i<bPath.length; ++i) {
			if(aPath[i][SPID] !== bPath[i][SPID])
				break;
		}

		// We ignore disjoint paths because that's what Flash does.
		return [aPath.slice(i).reverse(), bPath.slice(i)];
	}
	
	function helper_getBounds(rect, from, to) {
			// No translation needed
		if(from === to)
			return rect;
		
		var paths = helper_commonAncestorPaths(from, to);

		var matrixUp = new Matrix();
		paths[0].forEach(function(object) {
			matrixUp.concat(displayMatrixes[object[SPID]]);
		});

		var matrixDown = new Matrix();
		paths[1].forEach(function(object) {
			matrixDown.concat(displayMatrixes[object[SPID]]);
		});

		matrixDown.invert();
		matrixUp.concat(matrixDown);

		return helper_calcBounds(rect, matrixUp);
	}

	return helper_getBounds;
});
