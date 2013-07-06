define('flash/text/TextFormat', [
	'shared/default',
	'flash/text/TextFormatAlign',
	'shared/apply',
	'util/as3/inherit'
], function(
	__default,
	TextFormatAlign,
	apply,
	__inherit
) {
	/**
	 *
	 * .. warning::
	 *
	 *    You **must** specify a font; device fonts are not supported.
	 *
	 * .. Should we throw an exception to make this obvious?  Maybe native can
	 *    give us a list of fonts which are supported?  (Hidden event on
	 *    LoaderInfo?)  Dunno.
	 */
	function TextFormat(font, size, color, bold, italic, underline, url, target, align, leftMargin, rightMargin, indent, leading) {
		this.font        = __default(font, null);
		this.size        = __default(size, null);
		this.color       = __default(color, null);
		this.bold        = __default(bold, null);
		this.italic      = __default(italic, null);
		this.underline   = __default(underline, null);
		this.url         = __default(url, null);
		this.target      = __default(target, null);
		this.align       = __default(align, null);
		this.leftMargin  = __default(leftMargin, null);
		this.rightMargin = __default(rightMargin, null);
		this.indent      = __default(indent, null);
		this.leading     = __default(leading, null);

		this.blockIndent = null;
		this.bullet = null;
		this.kerning = null;
		this.letterSpacing = null;
		this.tabStops = null;
	}

	apply(TextFormat, {
		patch: function patch(target, patch, mutator) {
			mutator.patchObjectProperties(target, patch, [
				'font',
				'size',
				'color',
				'bold',
				'italic',
				'underline',
				'url',
				'target',
				'align',
				'leftMargin',
				'rightMargin',
				'indent',
				'leading',

				'blockIndent',
				'bullet',
				'kerning',
				'letterSpacing',
				'tabStops'
			]);
		}
	});

	return __inherit(TextFormat, Object);
});
