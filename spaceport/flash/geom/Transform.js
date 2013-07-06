define('flash/geom/Transform', [
	'proxy/ISpaceportSerializable',
	'flash/geom/ColorTransform',
	'shared/defineGetter',
	'shared/defineSetter',
	'util/constructRef',
	'util/as3/inherit',
	'util/display/displayMatrices',
	'util/display/displayColorTransform',
	'util/display/invalidateBounds',
	'bridge/send',
	'util/display/assignMatrix',
	'util/display/concatenatedMatrix',
	'flash/geom/Matrix',
	'util/oop/cast',
	'spid'
], function(
	ISpaceportSerializable,
	ColorTransform,
	defineGetter,
	defineSetter,
	__construct_ref,
	__inherit,
	displayMatrixes,
	displayColorTransforms,
	invalidateBounds,
	send,
	assignMatrix,
	concatenatedMatrix,
	Matrix,
	__cast,
	SPID
) {
	function clone_colorTransform(ct) {
		if(!ct)
			return new ColorTransform();
		
		return new ColorTransform(
			ct.redMultiplier, ct.greenMultiplier, ct.blueMultiplier, ct.alphaMultiplier,
			ct.redOffset, ct.greenOffset, ct.blueOffset, ct.alphaOffset
		);
	}
	
	function Transform(displayObject) {
		var id = displayObject[SPID];
		
		defineGetter(this, 'matrix', function get_matrix() {
			return displayMatrixes[id].clone();
		});

		defineSetter(this, 'matrix', function set_matrix(value) {
			value = __cast(value, Matrix);
			assignMatrix(displayObject, value);
			
			send('set', displayObject, null, 'transform.matrix', value);
		});

		defineGetter(this, 'colorTransform', function get_colorTransform() {
			return clone_colorTransform(displayColorTransforms[id]);
		});
		
		defineSetter(this, 'colorTransform', function set_colorTransform(value) {
			value = __cast(value, ColorTransform);

			displayColorTransforms[displayObject[SPID]] = value;
			
			send('set', displayObject, null, 'transform.colorTransform', value);
		});

		defineGetter(this, 'concatenatedMatrix', function get_concatenatedMatrix() {
			return concatenatedMatrix(displayObject);
		});

		defineGetter(this, 'concatenatedColorTransform', function get_concatenatedColorTransform() {
			var ct = new ColorTransform();

			var parent = displayObject;
			while(parent) {
				var ct2 = displayColorTransforms[parent[SPID]];
				if(ct2)
					ct.concat(ct2);
					
				parent = parent.parent;
			}
				
			return ct;
		});
/*
		defineGetter(this, 'pixelBounds', function get_pixelBounds() {
			return displayObject.getBounds(sp.stage);
		});
*/
		this.nativeSerialize = function nativeSerialize() {
			return __construct_ref('Transform', displayObject);
		};
	}
	
	return __inherit(Transform, ISpaceportSerializable);
});
