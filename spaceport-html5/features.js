define('features', [], function() {
	var ua = navigator.userAgent;

	// MIT: http://trac.webkit.org/wiki/DetectingWebKit
	var IS_WEBKIT = / AppleWebKit\//.test(ua);

	var IS_IOS = /iPhone|iPod|iOS|iPad/.test(ua) && IS_WEBKIT;
	var IS_FIREFOX = /Firefox/.test(ua);

	var IS_OPERA = window.opera && Object.prototype.toString.call(window.opera) === '[object Opera]';

	// Bug flags
	var FIREFOX_GRADIENT_BUG = IS_FIREFOX;
	var IOS_NO_SOUND_BUG = IS_IOS;
	var IOS_REQUESTANIMFRAME_BUG = IS_IOS;
	var WEBKIT_JITTER_BUG = IS_WEBKIT;
	var MATRIX_TRANSLATE_PX_BUG = IS_FIREFOX;
	var IOS_UPSIDE_DOWN_SVG_PATTERN_BUG = IS_IOS;
	var FILTER_IN_MASK_BUG = !IS_OPERA;

	// CSS feature detection based off of
	// http://andrew-hoyer.com/experiments/rain/
	// Public domain

	var style = document.createElement('div').style;

	function getStyleName(propertyNames) {
		return propertyNames.filter(function(name) {
			return name in style;
		}).shift();
	}

	var transformOriginStyleProperty = getStyleName([
		'transformOrigin',
		'WebkitTransformOrigin',
		'MozTransformOrigin',
		'msTransformOrigin',
		'OTransformOrigin'
	]);

	var transformStyleProperty = getStyleName([
		'transform',
		'WebkitTransform',
		'MozTransform',
		'msTransform',
		'OTransform'
	]);

	var supportsTransform3D = !!getStyleName([
		'perspectiveProperty',
		'WebkitPerspective',
		'MozPerspective',
		'msPerspective',
		'OPerspective'
	]);

	var transformTranslatePrefix = supportsTransform3D ? 'translate3D(' : 'translate(';
	var transformTranslateSuffix = supportsTransform3D ? ',0)' : ')';
	var matrixTranslateSuffix = MATRIX_TRANSLATE_PX_BUG ? 'px' : '';

	return {
		FIREFOX_GRADIENT_BUG: FIREFOX_GRADIENT_BUG,
		IOS_NO_SOUND_BUG: IOS_NO_SOUND_BUG,
		IOS_REQUESTANIMFRAME_BUG: IOS_REQUESTANIMFRAME_BUG,
		WEBKIT_JITTER_BUG: WEBKIT_JITTER_BUG,
		IOS_UPSIDE_DOWN_SVG_PATTERN_BUG: IOS_UPSIDE_DOWN_SVG_PATTERN_BUG,
		FILTER_IN_MASK_BUG: FILTER_IN_MASK_BUG,

		transformOriginStyleProperty: transformOriginStyleProperty,
		transformStyleProperty: transformStyleProperty,

		transformTranslatePrefix: transformTranslatePrefix,
		transformTranslateSuffix: transformTranslateSuffix,
		matrixTranslateSuffix: matrixTranslateSuffix
	};
});
