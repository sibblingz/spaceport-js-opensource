define('util/display/calcBounds', [
	'flash/geom/Rectangle'
], function(
	Rectangle
) {
	return function helper_calcBounds(rect, matrix) {
		var left   = rect.left;
		var right  = rect.right;
		var top    = rect.top;
		var bottom = rect.bottom;

		var a = matrix.a;
		var b = matrix.b;
		var c = matrix.c;
		var d = matrix.d;
		var tx = matrix.tx;
		var ty = matrix.ty;

		var leftA = a * left + tx;
		var leftB = b * left + ty;
		var rightA = a * right + tx;
		var rightB = b * right + ty;

		var topC = c * top;
		var topD = d * top;
		var bottomC = c * bottom;
		var bottomD = d * bottom;

		var topLeftX = leftA + topC;
		var topLeftY = leftB + topD;

		var topRightX = rightA + topC;
		var topRightY = rightB + topD;

		var bottomLeftX = leftA + bottomC;
		var bottomLeftY = leftB + bottomD;

		var bottomRightX = rightA + bottomC;
		var bottomRightY = rightB + bottomD;

		var minX = Math.min(topLeftX, topRightX, bottomLeftX, bottomRightX);
		var minY = Math.min(topLeftY, topRightY, bottomLeftY, bottomRightY);

		var maxX = Math.max(topLeftX, topRightX, bottomLeftX, bottomRightX);
		var maxY = Math.max(topLeftY, topRightY, bottomLeftY, bottomRightY);

		return new Rectangle(
			minX, minY,
			maxX - minX, maxY - minY
		);
	};
});
