define('bridge/dataLookup', [
	'util/Matrix'
], function(
	Matrix
) {
	return {
		'Point': function Point(x, y) {
			return {
				x: Number(x),
				y: Number(y)
			};
		},
		'Matrix': function Matrix_(a, b, c, d, tx, ty) {
			return new Matrix(
				Number(a), Number(b),
				Number(c), Number(d),
				Number(tx), Number(ty)
			);
		},
		'Rectangle': function Rectangle(x, y, width, height) {
			return {
				x: Number(x),
				y: Number(y),
				width: Number(width),
				height: Number(height)
			};
		},
		'Transform': function Transform() {
			
		},
		'URLRequest': function URLRequest(method, url, data) {
			return {
				method: String(method),
				url: unescape(url),
				data: data
			};
		},
		'PNGEncoder': function PNGEncoder() {
			
		},
		'ColorTransform': function ColorTransform() {
			
		},
		'Array': function Array() {
			var arr = [];
			arr.push.apply(arr, arguments);
			return arr;
		}
	};
});
