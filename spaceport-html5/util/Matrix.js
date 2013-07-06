define('util/Matrix', [
	'shared/internalError',
	'features'
], function(
	internalError,
	features
) {
	function numberToString(n) {
		var s = '' + n;
		if(s.indexOf('e') >= 0)
			return '0';
		else
			return s;
	}

	var matrixTranslateSuffix = features.matrixTranslateSuffix;

	function stringsToCssTransform(m) {
		return 'matrix(' +
			m[0] + ',' + m[1] + ',' +
			m[2] + ',' + m[3] + ',' +
			m[4] + matrixTranslateSuffix + ',' +
			m[5] + matrixTranslateSuffix +
			')';
	}

	function stringsToSvgTransform(m) {
		return 'matrix(' + m.join(' ') + ')';
	}

	function Matrix(a, b, c, d, tx, ty) {
		if(DEBUG) {
			var args = [a, b, c, d, tx, ty];
			if(args.some(isNaN)) {
				internalError(200, "NaN matrix arguments; " + args.join(", "));
			}
			if(!args.every(isFinite)) {
				internalError(201, "Infinite matrix arguments; " + args.join(", "));
			}
		}

		this.a = a;
		this.b = b;
		this.c = c;
		this.d = d;
		
		this.tx = tx;
		this.ty = ty;
	}
	
	Matrix.prototype = {
		'clone': function clone() {
			return new Matrix(
				this.a, this.b,
				this.c, this.d,
				this.tx, this.ty
			);
		},
		'times': function times(other) {
			return new Matrix(
				(this.a * other.a) + (this.b * other.c),
				(this.a * other.b) + (this.b * other.d),
				(this.c * other.a) + (this.d * other.c),
				(this.c * other.b) + (this.d * other.d),

				(other.a * this.tx) + (other.c * this.ty) + other.tx,
				(other.b * this.tx) + (other.d * this.ty) + other.ty
			);
		},
		'times_params': function times_params(oa, ob, oc, od, otx, oty) {
			// Mutates `this`
			// Watch out for reassignments!

			var tx = (oa * this.tx) + (oc * this.ty) + otx;
			this.ty = (ob * this.tx) + (od * this.ty) + oty;
			this.tx = tx;

			var a = (this.a * oa) + (this.b * oc);
			this.b = (this.a * ob) + (this.b * od);
			this.a = a;

			var c = (this.c * oa) + (this.d * oc);
			this.d = (this.c * ob) + (this.d * od);
			this.c = c;
		},
		'times_': function times_(other) {
			// Mutates `this`
			// Watch out for reassignments!

			var tx = (other.a * this.tx) + (other.c * this.ty) + other.tx;
			this.ty = (other.b * this.tx) + (other.d * this.ty) + other.ty;
			this.tx = tx;

			var a = (this.a * other.a) + (this.b * other.c);
			this.b = (this.a * other.b) + (this.b * other.d);
			this.a = a;

			var c = (this.c * other.a) + (this.d * other.c);
			this.d = (this.c * other.b) + (this.d * other.d);
			this.c = c;
		},
		'translated': function translated(x, y) {
			return new Matrix(
				this.a, this.b,
				this.c, this.d,
				this.tx + x, this.ty + y
			);
		},
		'inverted': function inverted() {
			var det = (this.a * this.d) - (this.b * this.c);

			if(det === 0) {
				return Matrix.identity;
			} else {
				return new Matrix(
					 this.d / det, -this.b / det,
					-this.c / det,  this.a / det,
					( (this.c * this.ty) - (this.d * this.tx)) / det,
					(-(this.a * this.ty) + (this.b * this.tx)) / det
				);
			}
		},
		'transformPoint': function transformPoint(x, y) {
			return [
				this.a * x + this.c * y + this.tx,
				this.b * x + this.d * y + this.ty
			];
		},
		'transformPoints': function transformPoints(points) {
			var xs = [];
			for(var i=0; i<points.length; ++i) {
				var p = points[i];
				xs.push([
					this.a * p[0] + this.c * p[1] + this.tx,
					this.b * p[0] + this.d * p[1] + this.ty
				]);
			}
			return xs;
		},
		'set': function set(a, b, c, d, tx, ty) {
			return new Matrix(
				a === null ? this.a : a,
				b === null ? this.b : b,
				c === null ? this.c : c,
				d === null ? this.d : d,
				tx === null ? this.tx : tx,
				ty === null ? this.ty : ty
			);
		},
		'toCssTransform': function toCssTransform() {
			return stringsToCssTransform(this.toStringArray());
		},
		'toSvgTransform': function toSvgTransform() {
			return stringsToSvgTransform(this.toStringArray());
		},
		'toStringArray': function toStringArray() {
			return [
				numberToString(this.a), numberToString(this.b),
				numberToString(this.c), numberToString(this.d),
				numberToString(this.tx), numberToString(this.ty)
			];
		},
		'toArray': function toArray() {
			return [
				this.a, this.b,
				this.c, this.d,
				this.tx, this.ty
			];
		}
	};

	Matrix.fromArray = function fromArray(array) {
		return new Matrix(
			array[0], array[1],
			array[2], array[3],
			array[4], array[5]
		);
	};
	Matrix.identity = new Matrix(1, 0, 0, 1, 0, 0);
	Matrix.translation = function translation(x, y) {
		return new Matrix(1, 0, 0, 1, x, y);
	};
	Matrix.rotation = function rotation(angle) {
		var sin = Math.sin(angle);
		var cos = Math.cos(angle);
		return new Matrix(cos, -sin, sin, cos, 0, 0);
	};
	Matrix.scale = function scale(x, y) {
		return new Matrix(x, 0, 0, y, 0, 0);
	};
	Matrix.fromCssTransform = function fromCssTransform(string) {
		var m = /^matrix\((.*)\)$/.exec(string)[1].split(',')
			.map(function(c) {
				return parseFloat(c, 10);
			});

		return Matrix.fromArray(m);
	};
	Matrix.fromSvgTransform = function fromSvgTransform(string) {
		var m = /^matrix\((.*)\)$/.exec(string)[1].split(' ')
			.map(function(c) {
				return parseFloat(c, 10);
			});

		return Matrix.fromArray(m);
	};

	Matrix.stringsToCssTransform = stringsToCssTransform;
	Matrix.stringsToSvgTransform = stringsToSvgTransform;

	return Matrix;
});
