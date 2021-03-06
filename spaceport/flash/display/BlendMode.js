define('flash/display/BlendMode', ['util/as3/createEnum'], function(__createEnum) {
	return __createEnum('BlendMode', {
		ADD: 'add',
		ALPHA: 'alpha',
		DARKEN: 'darken',
		DIFFERENCE: 'difference',
		ERASE: 'erase',
		HARDLIGHT: 'hardlight',
		INVERT: 'invert',
		LAYER: 'layer',
		LIGHTEN: 'lighten',
		MULTIPLY: 'multiply',
		NORMAL: 'normal',
		OVERLAY: 'overlay',
		SCREEN: 'screen',
		SHADER: 'shader',
		SUBTRACT: 'subtract'
	});
});
