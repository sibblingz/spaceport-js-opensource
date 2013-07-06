define('flash/display/Sprite', [
	'spid',
	'proxy/create',
	'util/proxy/hasLazyCreated',
	'util/display/getBounds',
	'util/display/graphicsBounds',
	'flash/display/Graphics',
	'flash/display/DisplayObjectContainer'
], function(
	SPID,
	createProxyClass,
	hasLazyCreated,
	helper_getBounds,
	graphicsBounds,
	Graphics,
	DisplayObjectContainer
) {
	var super_getBounds = DisplayObjectContainer.prototype.getBounds;
	
	return createProxyClass('Sprite', DisplayObjectContainer, {
		lazy: {
			graphics: Graphics
		},
		methods: {
			fake: {
				getBounds: function getBounds(targetCoordinateSpace) {
					var bounds = super_getBounds.call(this, this);
					
					if(hasLazyCreated(this, 'graphics'))
						bounds = bounds.union(graphicsBounds[this.graphics[SPID]]);
					
					return helper_getBounds(bounds, this, targetCoordinateSpace);
				}
			}
		}
	});
});
