define('display/DisplayListContainer', [
	'display/DisplayList',
	'dom/op',
	'features',
	'display/svgFills',
	'dom/checkedSetAttribute',
	'dom/checkedSetStyle',
	'dom/checkedSetAttributeNS',
	'dom/checkedSetStyleCached',
	'util/lightClass',
	'dom/svgNS',
	'util/cloneInstance',
	'dom/xlinkNS',
	'shared/internalError',
	'dom/removeNodesFrom'
], function(
	DisplayList,
	domOp,
	features,
	svgFills,
	checkedSetAttribute,
	checkedSetStyle,
	checkedSetAttributeNS,
	checkedSetStyleCached,
	lightClass,
	svgNS,
	cloneInstance,
	xlinkNS,
	internalError,
	removeNodesFrom
) {
	var transformOriginStyleProperty = features.transformOriginStyleProperty;
	var transformStyleProperty = features.transformStyleProperty;

	var transformTranslatePrefix = features.transformTranslatePrefix;
	var transformTranslateSuffix = features.transformTranslateSuffix;

	var DOM_INSERT = domOp.INSERT;
	var DOM_REMOVE = domOp.REMOVE;
	var DOM_REPLACE = domOp.REPLACE;
	var DOM_MOVE = domOp.MOVE;

	function setSvgViewBox(svgEl, wrapper, viewBox) {
		// Round width/height and x/y
		// TODO Smarter rounding
		viewBox = viewBox.slice();

		var ox = viewBox[0];
		var oy = viewBox[1];
		var owidth = viewBox[2];
		var oheight = viewBox[3];

		// Avoid moving layer around too much
		var oldViewBox = svgEl.getAttribute('viewBox');
		if(oldViewBox) {
			oldViewBox = oldViewBox.split(' ');
			var dx = ox - Math.min(ox, oldViewBox[0]);
			var dy = oy - Math.min(oy, oldViewBox[1]);
			ox -= dx;
			oy -= dy;
			owidth += dx;
			oheight += dy;
		}

		// Round width/height and x/y, growing not shrinking
		var ox2 = Math.floor(ox);
		var oy2 = Math.floor(oy);
		owidth = Math.ceil(ox + owidth) - ox2;
		oheight = Math.ceil(oy + oheight) - oy2;
		ox = ox2;
		oy = oy2;

		// Don't do unnecessary work if the viewBox is already set
		if (oldViewBox && oldViewBox[0] == ox && oldViewBox[1] == oy && oldViewBox[2] == owidth && oldViewBox[3] == oheight)
			return;

		// Cache bitmaps at 1.5 times the size for better quality
		// TODO Determine best scaleX/scaleY values
		var scaleX = 2;
		var scaleY = 2;

		var x = ox * scaleX;
		var y = oy * scaleY;

		var width = owidth * scaleX;
		var height = oheight * scaleY;

		if(features.WEBKIT_JITTER_BUG) {
			checkedSetStyle(svgEl, 'width', width + 'px');
			checkedSetStyle(svgEl, 'height', height + 'px');
		} else {
			checkedSetAttribute(svgEl, 'width', width);
			checkedSetAttribute(svgEl, 'height', height);
		}

		checkedSetAttribute(svgEl, 'viewBox', ox + ' ' + oy + ' ' + owidth + ' ' + oheight + ' ');

		var transform = '';
		if(!(wrapper.firstChild instanceof SVGUseElement)) { // ???  Why is this check here again...?
			transform += 'translate(' + -ox + ' ' + -oy + ') ';
		}
		transform += 'scale(' + scaleX + ' ' + scaleY + ')';
		checkedSetAttributeNS(wrapper, svgNS, 'transform', transform);

		checkedSetStyleCached(
			svgEl, 'data-s', transformStyleProperty,
			transformTranslatePrefix + ox + 'px,' + oy + 'px' + transformTranslateSuffix +
			' scale(' + (1 / scaleX) + ',' + (1 / scaleY) + ')'
		);
	}

	function applyDomEdits(el, domEdits) {
		for(var i=0; i<domEdits.length; ++i) {
			var domEdit = domEdits[i];
			switch(domEdit[0]) {
			case DOM_INSERT:
				// Insert the most common element we'll encounter.
				// We probably should actually insert the build
				// element, but no time to optimize and add
				// complexity now.
				var newEl = document.createElementNS(svgNS, 'g');
				var cn = el.childNodes;
				if(domEdit[1] >= cn.length) {
					el.appendChild(newEl);
				} else {
					el.insertBefore(newEl, cn[domEdit[1]]);
				}
				break;

			case DOM_REMOVE:
				var cn = el.childNodes;
				if(domEdit[1] < cn.length) {
					el.removeChild(el.childNodes[domEdit[1]]);
				}
				break;

			case DOM_REPLACE:
				// Do nothing
				break;

			case DOM_MOVE:
				var fromEl = el.childNodes[domEdit[1]];
				var toEl = el.childNodes[domEdit[2]];
				if(toEl.nextSibling) {
					el.insertBefore(fromEl, toEl.nextSibling);
				} else {
					el.appendChild(fromEl);
				}
				break;

			default:
				if(CUSTOMER_DEBUG) {
					internalError(101, "Invalid DOM command " + domEdit[0]);
				}
				break;
			}
		}
	}

	function buildChild(child, childNode, el, isMasking) {
		if(!childNode) {
			// Easy case: no element exists, so we create it
			el.appendChild(child.buildNewElement(isMasking));
			return null; // No children nodes left
		}

		var n = childNode.nextSibling;
		var parent = childNode.parentNode;

		// There are four combinations here:
		// Existing  Built
		// svg       svg   -- Easy
		// svg       dom   -- Meh
		// dom       svg   -- Meh
		// dom       dom   -- Easy
		//
		// SVG elements have the following structure:
		// <svg>
		//   <defs>
		//     <!-- colour transforms -->
		//   </defs>
		//   <g>
		//     <!-- children display lists ->
		//   </g>
		// </svg>
		var built;

		if(childNode instanceof SVGSVGElement && childNode.firstChild) {
			// Existing: svg
			var svgEl = childNode;
			var defs = svgEl.firstChild;
			var wrapper = defs.nextSibling;
			built = child.buildIntoElement(wrapper.firstChild, isMasking);

			if(built instanceof SVGElement) {
				// Built: svg
				setSvgViewBox(svgEl, wrapper, child.getBoundingBox());
			} else {
				// Built: dom
				parent.replaceChild(built, childNode);
			}
		} else {
			// Existing: dom
			built = child.buildIntoElement(childNode, isMasking);

			if(built instanceof SVGElement) {
				// Built: svg
				var svgEl = document.createElementNS(svgNS, 'svg');
				svgEl.style.position = 'absolute';
				svgEl.style[transformOriginStyleProperty] = '0 0';
				parent.replaceChild(svgEl, built);

				var defs = document.createElementNS(svgNS, 'defs');

				if(features.FIREFOX_GRADIENT_BUG) {
					// In Firefox, we need to "taint" an SVG
					// element by adding gradients which need to be
					// used.  Otherwise, gradients are not
					// understood by Firefox and display as a black
					// solid fill.
					svgFills.forEach(function(fill) {
						defs.appendChild(fill.cloneNode(true));
					});
				}

				// TODO Inject colour transforms (filters)
				svgEl.appendChild(defs);

				var wrapper = document.createElementNS(svgNS, 'g');
				wrapper.appendChild(built);
				svgEl.appendChild(wrapper);

				setSvgViewBox(svgEl, wrapper, child.getBoundingBox());
			} else {
				// Built: dom
			}
		}

		return n; // Continue with next sibling
	}

	var maskCounter = 0;

	function buildElementsInto(el, displayList, isMasking) {
		applyDomEdits(el, displayList.domEdits);
		displayList.domEdits.splice(0);

		function doChild(child, childNode, el, isMasking) {
			if(childNode) {
				var n = childNode.nextSibling;
				child.buildIntoElement(childNode, isMasking);
				return n;
			} else {
				el.appendChild(child.buildNewElement(isMasking));
				return null;
			}
		}

		var childNode = el.firstChild;
		var children = displayList.children;

		if(displayList.isPureSvg()) {
			var i = 0;
			while(i < children.length) {
				var child = children[i];

				if(child.maskCount) {
					// Masking object and following masked objects

					// TODO FIXME Handle features.FILTER_IN_MASK_BUG === false
					// (i.e. Opera)
					// https://www.pivotaltracker.com/story/show/24894007

					// First we define the <mask> element (which corresponds to
					// `child`).
					var maskID;
					if(childNode && childNode instanceof SVGMaskElement) {
						maskID = childNode.getAttribute('id');
						var n = doChild(child, childNode.firstChild, childNode, true);
						// Isaiah 44:6
						removeNodesFrom(n);

						childNode = childNode.nextSibling;
					} else {
						// Here a mask is being introduced.  This probably
						// should have happened due to a DOM edit (but it
						// didn't, because we don't write DOM edits for new
						// masks.)

						maskID = 'mask_' + maskCounter;
						++maskCounter;

						var mask = document.createElementNS(svgNS, 'mask');
						mask.setAttribute('id', maskID);
						mask.appendChild(child.buildNewElement(true /* isMasking */));

						if(childNode) {
							el.insertBefore(mask, childNode);
						} else {
							el.appendChild(mask);
						}
					}

					// Then we build a container for the next `child.maskCount`
					// children.
					var g;
					if(childNode && childNode instanceof SVGGElement) {
						g = childNode;

						// Clear all properties of the <g>
						// List corresponds to properties set in DisplayList
						g.removeAttribute('style');
						g.removeAttribute('data-t');
						g.removeAttribute('data-s');
						g.removeAttribute('transform');

						childNode = childNode.nextSibling;
					} else {
						g = document.createElementNS(svgNS, 'g');
						if(childNode) {
							el.insertBefore(g, childNode);
						} else {
							el.appendChild(g);
						}
					}

					g.setAttribute('mask', 'url(#' + maskID + ')');

					// Finally we build the children which are masked by
					// `child` (i.e. the `child.maskCount` children after
					// `child`).
					var subChildNode = g.firstChild;
					var stopIndex = Math.min(children.length - 1, i + child.maskCount);
					++i;
					while(i <= stopIndex) {
						subChildNode = doChild(children[i], subChildNode, g, isMasking);
						++i;
					}

					removeNodesFrom(subChildNode);
				} else {
					// Unmasked object
					childNode = doChild(child, childNode, el, isMasking);
					++i;
				}
			}
		} else {
			for(var i=0; i<children.length; ++i) {
				childNode = buildChild(children[i], childNode, el, isMasking);
			}
		}

		// Remove remaining elements
		removeNodesFrom(childNode);

		return el;
	}

	var DisplayListContainer = lightClass(DisplayList, {
		constructor: function DisplayListContainer(children) {
			this.children = children instanceof Array ? children : [];

			// The DOM edits array lets us batch insertions and removals
			// in the DOM without actually touching the DOM.
			//
			// Format is:
			// [
			//   [DOM_INSERT, index],
			//   [DOM_REMOVE, index],
			//   [DOM_REPLACE, index],
			//   [DOM_MOVE, fromIndex, toIndex]
			// ]
			this.domEdits = [];
		},

		'buildNewElementImpl': function buildNewElementImpl(isMasking) {
			var el;
			if (this.isPureSvg()) {
				el = document.createElementNS(svgNS, 'g');
			} else {
				el = document.createElement('div');
				el.style.position = 'absolute';
			}

			return this.buildIntoElement(el, isMasking);
		},

		'buildIntoElementImpl': function buildIntoElementImpl(el, isMasking) {
			var expectedLocalName = this.isPureSvg() ? 'g' : 'div';

			// toLowerCase needed for Opera (who gives us 'DIV' not 'div')
			if(el.localName.toLowerCase() !== expectedLocalName) {
				return this.reject(el);
			}

			return buildElementsInto(el, this, isMasking);
		},

		'isPureSvg': function isPureSvg() {
			return this.children.every(function(child) {
				return child.isPureSvg();
			});
		},

		'clone': function clone() {
			var cloned = new DisplayListContainer(this.children.map(cloneInstance));
			this.copyEffectsTo(cloned);
			return cloned;
		},
		'getBoundingPoints': function getBoundingPoints() {
			// Optimized for le speed
			var rawPoints = [];
			var child, children = this.children;
			for(var i=0; (child=children[i]); ++i)
				rawPoints.push.apply(rawPoints, child.getBoundingPoints());
			return this.getEffectiveTransformMatrix().transformPoints(rawPoints);
		}
	});

	return DisplayListContainer;
});
