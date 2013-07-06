define('flash/geom/Matrix', [
	'flash/geom/Point',
	'proxy/ISpaceportSerializable',
	'util/numberDefault',
	'util/constructRef',
	'util/as3/geomToString',
	'util/as3/inherit'
], function(
	Point,
	ISpaceportSerializable,
	__number_default,
	__construct_ref,
	__as3_toString,
	__inherit
) {
	function Matrix(a, b, c, d, tx, ty) {
		this.a = __number_default(a, 1);
		this.b = __number_default(b, 0);
		this.c = __number_default(c, 0);
		this.d = __number_default(d, 1);
		
		this.tx = __number_default(tx, 0);
		this.ty = __number_default(ty, 0);
	};
	
	return __inherit(Matrix, ISpaceportSerializable, {
		'clone': function clone() {
			return new Matrix(
				this.a, this.b,
				this.c, this.d,
				this.tx, this.ty
			);
		},
		'concat': function concat(m) {
			var l = this.clone();
			m = m.clone();
			
			this.a = (l.a * m.a) + (l.b * m.c);
			this.b = (l.a * m.b) + (l.b * m.d);
			this.c = (l.c * m.a) + (l.d * m.c);
			this.d = (l.c * m.b) + (l.d * m.d);
			
			this.tx = (m.a * l.tx) + (m.c * l.ty) + m.tx;
			this.ty = (m.b * l.tx) + (m.d * l.ty) + m.ty;
		},
		'createBox': function createBox(scaleX, scaleY, rotation, tx, ty) {
			var cos = Math.cos(rotation);
			var sin = Math.sin(rotation);
			
			this.a =  cos * scaleX;
			this.b =  sin * scaleY;
			this.c = -sin * scaleX;
			this.d =  cos * scaleY;
			this.tx = tx;
			this.ty = ty;
		},
		'identity': function identity() {
			this.a = 1;
			this.b = 0;
			this.c = 0;
			this.d = 1;
			
			this.tx = 0;
			this.ty = 0;
		},
		'invert': function invert() {
			var l = this.clone();
			var det = (l.a * l.d) - (l.b * l.c);
			
			if(det === 0) {
				this.identity();
			} else {
				this.a =  l.d / det;
				this.b = -l.b / det;
				this.c = -l.c / det;
				this.d =  l.a / det;
				this.tx = ( (l.c * l.ty) - (l.d * l.tx)) / det;
				this.ty = (-(l.a * l.ty) + (l.b * l.tx)) / det;
			}
		},
		'rotate': function rotate(angle) {
			var cos = Math.cos(angle);
			var sin = Math.sin(angle);
			
			this.concat(new Matrix(cos, sin, -sin, cos));
		},
		'scale': function scale(sx, sy) {
			this.concat(new Matrix(sx, 0, 0, sy));
		},
		'toString': function toString() {
			return __as3_toString(this, 'a', 'b', 'c', 'd', 'tx', 'ty');
		},
		'transformPoint': function transformPoint(point) {
			return new Point(
				this.a * point.x + this.c * point.y + this.tx,
				this.b * point.x + this.d * point.y + this.ty
			);
		},
		'deltaTransformPoint': function deltaTransformPoint(point) {
			return new Point(
				this.a * point.x + this.c * point.y,
				this.b * point.x + this.d * point.y
			);
		},
		'translate': function translate(tx, ty) {
			this.tx += tx;
			this.ty += ty;
		},
		'nativeSerialize': function nativeSerialize() {
			return __construct_ref('Matrix', [this.a, this.b, this.c, this.d, this.tx, this.ty]);
		}
	});
});
