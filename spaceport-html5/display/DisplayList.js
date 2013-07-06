define('display/DisplayList', [
	'util/Matrix',
	'dom/checkedSetStyle',
	'dom/checkedSetStyleCached',
	'features',
	'dom/checkedSetAttributeCached',
	'shared/internalError',
	'util/lightClass'
], function(
	Matrix,
	checkedSetStyle,
	checkedSetStyleCached,
	features,
	checkedSetAttributeCached,
	internalError,
	lightClass
) {
	var transformOriginStyleProperty = features.transformOriginStyleProperty;
	var transformStyleProperty = features.transformStyleProperty;

	var transformTranslatePrefix = features.transformTranslatePrefix;
	var transformTranslateSuffix = features.transformTranslateSuffix;

	var DisplayList = lightClass({
		constructor: function DisplayList() {
			this.x = 0;
			this.y = 0;
			this.localX = 0;
			this.localY = 0;
			this.originX = 0;
			this.originY = 0;
			this.scaleX = 1;
			this.scaleY = 1;
			this.rotation = 0;
			this.alpha = 1;
			this.filterAlpha = 1; // From colour transforms TEMP
			this.transform = Matrix.identity;
			this.svgFilter = '';
			this.visible = true;

			this.effectiveTransformDirty = true;

			// XXX Mutated; do NOT use a shared instance (e.g. Matrix.identity)
			this.effectiveTransformCache = new Matrix(1, 0, 0, 1, 0, 0);

			// How many objects *after* this one to mask *by* this object.
			// In Flash land, this is endDepth - startDepth.
			this.maskCount = 0;
		},

		// Build the display list into an existing element.  The given element
		// may be replaced.  The final element representing the display list is
		// returned.
		'buildIntoElement': function buildIntoElement(el, isMasking) {
			var built = this.buildIntoElementImpl(el, isMasking);
			this.applyEffects(built);
			return built;
		},

		'buildIntoElementImpl': function buildIntoElementImpl(el, isMasking) {
			// Override me
			return this.reject(el);
		},

		// build the display list into a new element.  The
		// build element is returned.
		'buildNewElement': function buildNewElement(isMasking) {
			var built = this.buildNewElementImpl(isMasking);
			this.applyEffects(built);
			return built;
		},

		'buildNewElementImpl': function buildNewElementImpl(isMasking) {
			// Override me
			internalError(122, "Abstract method called");
		},

		// Returns true if the element can be embedded fully into an
		// <svg> element; false if an HTML container is required.
		'isPureSvg': function isPureSvg() {
			// Override me
			internalError(121, "Abstract method called");
		},

		'getEffectiveTransformMatrix': function getEffectiveTransformMatrix() {
			if(!this.effectiveTransformDirty) {
				return this.effectiveTransformCache;
			}

			/*
			var m = Matrix.identity
				.times(Matrix.translation(this.localX, this.localY))
				.times(this.transform || Matrix.identity)
				.times(Matrix.scale(this.scaleX, this.scaleY))
				.times(Matrix.rotation(-this.rotation / 360 * Math.PI * 2))
				.times(Matrix.translation(this.x - this.originX, this.y - this.originY))
				;
			*/
			// Unrolled for speed (damnit, Safari!)
			var m = this.effectiveTransformCache;
			m.a = 1;
			m.b = 0;
			m.c = 0;
			m.d = 1;
			m.tx = this.localX;
			m.ty = this.localY;

			if(this.transform) {
				m.times_(this.transform);
			}

			m.times_params(this.scaleX, 0, 0, this.scaleY, 0, 0);
			m.times_(Matrix.rotation(-this.rotation / 360 * Math.PI * 2));
			m.times_params(1, 0, 0, 1, this.x - this.originX, this.y - this.originY);

			this.effectiveTransformDirty = false;

			var strings = m.toStringArray();
			this.effectiveTransformSvgCache = Matrix.stringsToSvgTransform(strings);
			this.effectiveTransformCssCache = Matrix.stringsToCssTransform(strings);

			return m;
		},

		'applyEffects': function applyEffects(el) {
			if(!this.visible) {
				checkedSetStyle(el, 'display', 'none');
				return;
			}

			if(!(el instanceof SVGElement) || el instanceof SVGSVGElement) {
				checkedSetStyle(el, 'display', 'block');
			}

			// Cache SVG/CSS transform string
			this.getEffectiveTransformMatrix();

			if(el instanceof SVGElement) {
				var trans = this.effectiveTransformSvgCache;
				checkedSetAttributeCached(el, 'data-t', 'transform', trans);

				// TODO Inject colour transforms (filters) into defs
				//checkedSetAttribute(el, 'filter', this.svgFilter);
			} else {
				var origin = this.originX + 'px ' + this.originY + 'px';
				var trans = this.effectiveTransformCssCache;

				checkedSetStyle(el, transformOriginStyleProperty, origin);
				checkedSetStyleCached(el, 'data-s', transformStyleProperty, trans);
			}

			checkedSetStyle(el, 'opacity', this.alpha * this.filterAlpha);
		},

		'copyEffectsTo': function copyEffectsTo(target) {
			target.x = this.x;
			target.y = this.y;
			target.localX = this.localX;
			target.localY = this.localY;
			target.originX = this.originX;
			target.originY = this.originY;
			target.scaleX = this.scaleX;
			target.scaleY = this.scaleY;
			target.rotation = this.rotation;
			target.alpha = this.alpha;
			target.filterAlpha = this.filterAlpha;
			target.transform = this.transform;
			target.svgFilter = this.svgFilter;
			target.visible = this.visible;

			target.effectiveTransformDirty = true;
		},

		// Reject the element, meaning the element is not appropriate for this
		// display list.  A new element is built (using buildNewElement) and
		// replaces the given element.
		'reject': function reject(el) {
			var newEl = this.buildNewElement();
			if(el.parentNode)
				el.parentNode.replaceChild(newEl, el);
			return newEl;
		},

		'clone': function clone() {
			var cloned = new DisplayList();
			this.copyEffectsTo(cloned);
			return cloned;
		},

		'getBoundingPoints': function getBoundingPoints() {
			internalError(120, "Abstract method called");
		},

		'getBoundingBox': function getBoundingBox() {
			var points = this.getBoundingPoints();
			if(!points.length)
				return [0, 0, 0, 0]; // Invalid

			var minX = Infinity;
			var minY = Infinity;
			var maxX = -Infinity;
			var maxY = -Infinity;

			for(var i=0; i<points.length; ++i) {
				var p = points[i];
				var x = p[0];
				var y = p[1];

				if(x < minX)
					minX = x;
				if(y < minY)
					minY = y;

				if(x > maxX)
					maxX = x;
				if(y > maxY)
					maxY = y;
			}

			return [
				minX, minY,
				maxX - minX, maxY - minY
			];
		}
	});

	return DisplayList;
});
