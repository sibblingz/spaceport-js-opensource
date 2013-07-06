define('util/display/assignMatrix', [
	'spid',
	'proxy/instanceProperties',
	'util/display/displayMatrices',
	'util/display/invalidateBounds'
], function(
	SPID,
	instanceProperties,
	displayMatrixes,
	invalidateBounds
) {
	function dot(x1, y1, x2, y2) {
		return x1 * x2 + y1 * y2;
	}
	
	/**
	 * Use that instead of setting matrix manually.
	 * It will invalidate bounds, reassign the matrix and all properties
	 * (x, y, scaleX, scaleY, rotation)
	 */
	return function assignMatrix(displayObject, matrix) {
		var a1x = matrix.a;
		var a1y = matrix.b;

		var e1l = Math.sqrt(dot(a1x, a1y, a1x, a1y));
		var e1x = a1x / e1l;
		var e1y = a1y / e1l;

		var a2x = matrix.c;
		var a2y = matrix.d;

		var a2pe1 = dot(a2x, a2y, e1x, e1y);
		var u2x = a2x - (e1x * a2pe1);
		var u2y = a2y - (e1y * a2pe1);

		var u2l = Math.sqrt(dot(u2x, u2y, u2x, u2y));
		var e2x = u2x / u2l;
		var e2y = u2y / u2l;

		var scaleX = dot(matrix.a, matrix.b, e1x, e1y);
		var scaleY = dot(matrix.c, matrix.d, e2x, e2y) * (e1x * e2y - e1y * e2x);
		var rotation = Math.atan2(e1y, e1x) * 180 / Math.PI;
		
		var id = displayObject[SPID];
		
		invalidateBounds(displayObject);
		displayMatrixes[id] = matrix.clone();
		
		var attrs = instanceProperties[id];
		attrs.scaleX = scaleX;
		attrs.scaleY = scaleY;
		attrs.rotation = rotation;
	};
});
