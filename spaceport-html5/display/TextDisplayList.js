define('display/TextDisplayList', [
	'display/DisplayList',
	'util/lightClass',
	'dom/svgNS'
], function(
	DisplayList,
	lightClass,
	svgNS
) {
	function findElementIn(el, elementName) {
		if (el.nodeType === document.TEXT_NODE) {
			return null;
		} else if (el.tagName.toLowerCase() === elementName) {
			// I hate comparing strings like this...
			return el;
		} else {
			return el.querySelector(elementName);
		}
	}

	var TextDisplayList = lightClass(DisplayList, {
		constructor: function TextDisplayList(bounds) {
			this.bounds = bounds;
			this.updateDom([]);
		},
		'updateDom': function updateDom(els) {
			// textHeight works around a bug in Safari where we can't position
			// the text based on top-left.  (Stupid, right?)
			this.textHeight = els.reduce(function(acc, el) {
				var fontEl = findElementIn(el, 'font');
				if(fontEl)
					return Math.max(acc, fontEl.getAttribute('size'));
				else
					return acc;
			}, 0);

			this.localY = this.textHeight;

			this.htmlDomElements = els;
		},
		'buildNewElementImpl': function buildNewElementImpl() {
			var el = document.createElementNS(svgNS, 'text');
			return this.buildIntoElement(el);
		},
		'buildIntoElementImpl': function buildIntoElementImpl(el) {
			if(!(el instanceof SVGTextElement))
				return this.reject(el);

			while(el.firstChild)
				el.removeChild(el.firstChild);

			this.htmlDomElements.forEach(function(domEl) {
				var tspan = document.createElementNS(svgNS, 'tspan');

				// TODO More formatting
				var fontFamily = null;
				var fontSize = null;
				var fill = null;
				var letterSpacing = 0;
				var kerning = 0;
				var align = 'left';

				var pEl = findElementIn(domEl, 'p');
				if(pEl) {
					align = pEl.getAttribute('align');
				}

				var fontEl = findElementIn(domEl, 'font');
				if(fontEl) {
					fontFamily = fontEl.getAttribute('face');
					fontSize = fontEl.getAttribute('size');
					fill = fontEl.getAttribute('color');
					letterSpacing = fontEl.getAttribute('letterSpacing');
					kerning = fontEl.getAttribute('kerning');
				}

				var text = domEl.textContent;
				tspan.textContent = text;

				if(fontFamily)
					tspan.setAttribute('font-family', fontFamily);
				if(fontSize)
					tspan.setAttribute('font-size', fontSize);
				if(fill)
					tspan.setAttribute('fill', fill);
				if(letterSpacing)
					tspan.setAttribute('letter-spacing', letterSpacing);
				if(kerning)
					tspan.setAttribute('kerning', kerning);

				switch(align.toLowerCase()) {
					default:
					case 'left':
							tspan.setAttribute('x', 0);
							tspan.setAttribute('text-anchor', 'start');
						break;
					case 'right':
							tspan.setAttribute('x', this.bounds[2]);
							tspan.setAttribute('text-anchor', 'end');
						break;
					case 'center':
							tspan.setAttribute('x', this.bounds[2] / 2);
							tspan.setAttribute('text-anchor', 'middle');
						break;
				}

				el.appendChild(tspan);
			}, this);

			return el;
		},
		'isPureSvg': function isPureSvg() {
			return true;
		},
		'clone': function clone() {
			var cloned = new TextDisplayList(this.bounds);
			this.copyEffectsTo(cloned);
			return cloned;
		},
		'getBoundingPoints': function getBoundingPoints() {
			var b = this.bounds;

			// Local translation is accounted for in the transform matrix, so
			// don't use this.bounds[0,1].

			return this.getEffectiveTransformMatrix().transformPoints([
				[0   , -this.textHeight       ],
				[b[2], -this.textHeight       ],
				[0   , -this.textHeight + b[3]],
				[b[2], -this.textHeight + b[3]]
			]);
		}
	});

    return TextDisplayList;
});
