define('display/ShapeDisplayList', [
	'display/DisplayList',
	'dom/checkedSetAttributeNS',
	'dom/checkedSetAttribute',
	'util/lightClass',
	'dom/xlinkNS',
	'dom/svgNS',
	'features'
], function(
	DisplayList,
	checkedSetAttributeNS,
	checkedSetAttribute,
	lightClass,
	xlinkNS,
	svgNS,
	features
) {
	var ShapeDisplayList = lightClass(DisplayList, {
		constructor: function ShapeDisplayList(href, bounds) {
			this.href = href;
			this.bounds = bounds.slice();
		},

		'buildNewElementImpl': function buildNewElementImpl(isMasking) {
			// Inlined for speed; see buildIntoElementImpl
			var el = document.createElementNS(svgNS, 'use');

			var href = this.href;
			if(features.FILTER_IN_MASK_BUG && isMasking) {
				href += '_white'; // See JVO Loader
			}

			el.setAttributeNS(xlinkNS, 'href', href);
			el.setAttribute('width', this.bounds[2]);
			el.setAttribute('height', this.bounds[3]);
			return el;
		},
		'buildIntoElementImpl': function buildIntoElementImpl(el, isMasking) {
			if(el instanceof SVGUseElement) {
				var href = this.href;
				if(features.FILTER_IN_MASK_BUG && isMasking) {
					href += '_white'; // See JVO Loader
				}

				checkedSetAttributeNS(el, xlinkNS, 'href', href);
				checkedSetAttribute(el, 'width', this.bounds[2]);
				checkedSetAttribute(el, 'height', this.bounds[3]);
				return el;
			} else {
				return this.reject(el);
			}
		},
		'isPureSvg': function isPureSvg() {
			return true;
		},
		'clone': function clone() {
			var cloned = new ShapeDisplayList(this.href, this.bounds);
			this.copyEffectsTo(cloned);
			return cloned;
		},
		'getBoundingPoints': function getBoundingPoints() {
			var b = this.bounds;

			// Local translation is accounted for in the transform matrix, so
			// don't use this.bounds[0,1].

			return this.getEffectiveTransformMatrix().transformPoints([
				[0   , 0   ],
				[b[2], 0   ],
				[0   , b[3]],
				[b[2], b[3]]
			]);
		}
	});

	return ShapeDisplayList;
});
