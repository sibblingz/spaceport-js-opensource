define('flash/geom/Point', [
	'proxy/ISpaceportSerializable',
	'util/numberDefault',
	'shared/apply',
	'util/constructRef',
	'util/as3/geomToString',
	'util/as3/inherit'
], function(
	ISpaceportSerializable,
	__number_default,
	apply,
	__construct_ref,
	__as3_toString,
	__inherit
) {
	function Point(x, y) {
		this.x = __number_default(x, 0);
		this.y = __number_default(y, 0);
	};
	
	// Static
	apply(Point, {
		'polar': function polar(len, angle) {
			var x = len * Math.cos(angle);
			var y = len * Math.sin(angle);

			return new Point(x,y);
		},
		'distance': function distance(pt1, pt2) {
			return pt1.subtract(pt2).length;
		},
		'interpolate': function interpolate(pt1, pt2, f) {
			var x = pt2.x * (1 - f) + pt1.x * f;
			var y = pt2.y * (1 - f) + pt1.y * f;

			return new Point(x,y);
		}
	});
	
	return __inherit(Point, ISpaceportSerializable, {
		get length() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		},
		'add': function add(v) {
			return new Point(this.x + v.x, this.y + v.y);
		},
		'clone': function clone() {
			return new Point(this.x, this.y);
		},
		'equals': function equals(toCompare) {
			return this.x == toCompare.x && this.y == toCompare.y;
		},
		'normalize': function normalize(thickness) {
			var length = this.length;
			if(!length)
				return 0;

			this.x = this.x / length * thickness;
			this.y = this.y / length * thickness;
		},
		'offset': function offset(dx, dy) {
			this.x += dx;
			this.y += dy;
		},
		'subtract': function subtract(v) {
			return new Point(this.x - v.x, this.y - v.y);
		},
		'setTo': function(x, y) {
			this.x = x;
			this.y = y;
		},
		'toString': function toString() {
			return __as3_toString(this, 'x', 'y');
 		},
 		'nativeSerialize': function nativeSerialize() {
			return __construct_ref('Point', [this.x, this.y]);
		}
	});
});
