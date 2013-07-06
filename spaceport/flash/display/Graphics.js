define('flash/display/Graphics', [
	'spid',
	'proxy/create',
	'proxy/ProxyClass',
	'flash/geom/Rectangle',
	'util/display/graphicsBounds'
], function(
	SPID,
	createProxyClass,
	ProxyClass,
	Rectangle,
	graphicsBounds
) {
	function growBounds(ofwhat, withwhat) {
		var id = ofwhat[SPID];
		graphicsBounds[id] = graphicsBounds[id].union(withwhat);
	}

	return createProxyClass('Graphics', {
		constructor: function DisplayObject() {
			graphicsBounds[this[SPID]] = new Rectangle();
		},
		methods: {
			real: {
				'beginFill': true,
				'clear': function clear() {
					// Reset bounds
					graphicsBounds[this[SPID]].setEmpty();
				},
				'drawCircle': function drawCircle(x, y, radius) {
					growBounds(this, new Rectangle(x, y, radius, radius))
				},
				'drawEllipse': function drawEllipse(x, y, width, height) {
					growBounds(this, new Rectangle(x, y, width, height))
				},
				'drawRect': function drawRect(x, y, width, height) {
					growBounds(this, new Rectangle(x, y, width, height))
				},
				'drawRoundRect': function drawRect(x, y, width, height, ellipseWidth, ellipseHeight) {
					growBounds(this, new Rectangle(x, y, width, height))
				},
				'endFill': true
			},
			fake: {
				'destroy': function destroy(deep) {
					delete graphicsBounds[this[SPID]];
					
					// super
					ProxyClass.prototype.destroy.call(this, deep);
				}
			}
		}
	}); 
});
