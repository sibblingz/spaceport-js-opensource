define('flash/geom/Rectangle', [
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
	function Rectangle(x, y, width, height) {
		this.x = __number_default(x, 0);
		this.y = __number_default(y, 0);
		this.width = __number_default(width, 0);
		this.height = __number_default(height, 0);
	};
	
	return __inherit(Rectangle, ISpaceportSerializable, {
		get bottom() {
			return this.y + this.height;
		},
		set bottom(value) {
			this.height = value - this.y ;
		},
		get bottomRight() {
			return new Point(this.right, this.bottom);
		},
		set bottomRight(value) {
			this.right  = value.x;
			this.bottom = value.y;
		},
		get left() {
			return this.x;
		},
		set left(value) {
			this.width += this.x - value;
			this.x = value;
		},
		get right() {
			return this.x + this.width;
		},
		set right(value) {
			this.width = value - this.x;
		},
		get size() {
			return new Point(this.width, this.height);
		},
		set size(value) {
			this.width  = value.x;
			this.height = value.y;
		},
		get top() {
			return this.y;
		},
		set top(value) {
			this.height += this.y - value;
			this.y = value;
		},
		get topLeft() {
			return new Point(this.left, this.top);
		},
		set topLeft(value) {
			this.left = value.x;
			this.top  = value.y;
		},
		'clone': function clone() {
			return new Rectangle(this.x, this.y, this.width, this.height);
		},
		'contains': function contains(x, y) {
			if(x < this.left)
				return false;
			if(x >= this.right)
				return false;

			if(y < this.top)
				return false;
			if(y >= this.bottom)
				return false;
			
			return true;
		},
		'containsPoint': function containsPoint(point) {
			if(point.x < this.left)
				return false;
			if(point.x >= this.right)
				return false;

			if(point.y < this.top)
				return false;
			if(point.y >= this.bottom)
				return false;
			
			return true;
		},
		'containsRect': function containsRect(rect) {
			if(rect.isEmpty())
				return false;
			
			if(this.equals(rect))
				return true;
			
			return this.containsPoint(rect.topLeft) && this.containsPoint(rect.bottomRight);
		},
		'equals': function equals(toCompare) {
			return this.topLeft.equals(toCompare.topLeft) && this.bottomRight.equals(toCompare.bottomRight);
		},
		'inflate': function inflate(dx, dy) {
			this.x -= dx;
			this.y -= dy;
			this.width  += 2 * dx;
			this.height += 2 * dy;
		},
		'inflatePoint': function inflatePoint(point) {
			this.x -= point.x;
			this.y -= point.y;
			this.width  += 2 * point.x;
			this.height += 2 * point.y;
		},
		'intersection': function intersection(toIntersect) {
			if(this.isEmpty() || toIntersect.isEmpty())
				return new Rectangle();
			
			var x = Math.max(this.left  , toIntersect.left  );
			var y = Math.max(this.top   , toIntersect.top   );
			var r = Math.min(this.right , toIntersect.right );
			var b = Math.min(this.bottom, toIntersect.bottom);
			
			if(x > r || y > b || r - x == 0 || b - y === 0)
				return new Rectangle();
			
			return new Rectangle(x, y, r - x, b - y);
		},
		'intersects': function intersects(toIntersect) {
			if(this.isEmpty() || toIntersect.isEmpty())
				return false;
				
			var x = Math.max(this.left  , toIntersect.left  );
			var y = Math.max(this.top   , toIntersect.top   );
			var r = Math.min(this.right , toIntersect.right );
			var b = Math.min(this.bottom, toIntersect.bottom);
			
			if(x > r || y > b || r - x == 0 || b - y == 0)
				return false;
			
			return true;
		},
		'isEmpty': function isEmpty() {
			return this.width <= 0 || this.height <= 0;
		},
		'offset': function offset(dx, dy) {
			this.x += dx;
			this.y += dy;
		},
		'offsetPoint': function offset(point) {
			this.x += point.x;
			this.y += point.y;
		},
		'setEmpty': function setEmpty() {
			this.x = 0;
			this.y = 0;
			this.width  = 0;
			this.height = 0;
		},
		'setTo': function setTo(xa, ya, widtha, heighta) {
			this.x = xa;
			this.y = ya;
			this.width  = widtha;
			this.height = heighta;
		},
		'toString': function toString() {
			// Do not use __as3_toString, since 'width' isn't 'w' and 'h' isn't 'height'
			return '(x=' + this.x + ', y=' + this.y + ', w=' + this.width + ', h=' + this.height + ')';
		},
		'union': function union(toUnion) {
			if(this.isEmpty())
				return toUnion;

			if(toUnion.isEmpty())
				return this.clone();

			var x = Math.min(this.left  , toUnion.left  );
			var y = Math.min(this.top   , toUnion.top   );
			var r = Math.max(this.right , toUnion.right );
			var b = Math.max(this.bottom, toUnion.bottom);
			
			return new Rectangle(x, y, r - x, b - y);
		},
		'nativeSerialize': function nativeSerialize() {
			return __construct_ref('Rectangle', [this.x, this.y, this.width, this.height]);
		}
	});
});
