define('flash/display/Shape', [
	'spid',
	'proxy/create',
	'util/proxy/hasLazyCreated',
	'util/display/getBounds',
	'util/display/displaySize',
	'util/display/graphicsBounds',
	'flash/display/DisplayObject',
	'flash/display/Graphics',
	'flash/geom/Rectangle'
], function(
	SPID,
	createProxyClass,
	hasLazyCreated,
	helper_getBounds,
	displaySize,
	graphicsBounds,
	DisplayObject,
	Graphics,
	Rectangle
) {
	var super_getBounds = DisplayObject.prototype.getBounds;
	
	return createProxyClass('Shape', DisplayObject, {
		lazy: {
			graphics: Graphics
		},
		methods: {
			fake: {
				getBounds: function getBounds(targetCoordinateSpace) {
					var bounds = displaySize[this[SPID]] || [];
					
					bounds = new Rectangle(bounds[0], bounds[1], bounds[2], bounds[3]);
					if(hasLazyCreated(this, 'graphics'))
						bounds = bounds.union(graphicsBounds[this.graphics[SPID]]);
					
					return helper_getBounds(bounds, this, targetCoordinateSpace);
				}
			}
		}
	});
});
