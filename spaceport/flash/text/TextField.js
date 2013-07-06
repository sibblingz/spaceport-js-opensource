define('flash/text/TextField', [
	'proxy/create',
	'shared/apply',
	'flash/display/InteractiveObject',
	'flash/text/TextFormat',
	'flash/text/TextFieldAutoSize',
	'flash/text/TextFormatAlign',
	'flash/text/TextFieldType',
	'shared/defineGetter',
	'shared/defineSetter',
	'bridge/send',
	'util/display/displaySize',
	'util/oop/cast',
	'shared/utf8/encode'
], function(
	createProxyClass,
	apply,
	InteractiveObject,
	TextFormat,
	TextFormatAutoSize,
	TextFormatAlign,
	TextFieldType,
	defineGetter,
	defineSetter,
	send,
	displaySize,
	__cast,
	utf8_encode
) {
	var DEFAULT_FONT = 'Times';
	var NEWLINE_SPLIT = /\r|\n/g;
	
	var defaultTF = {
		align: TextFormatAlign.LEFT,
		blockIndent: 0,
		bold: false,
		bullet: false,
		color: 0x000000,
		font: DEFAULT_FONT,
		indent: 0,
		italic: false,
		kerning: false,
		leading: 0,
		leftMargin: 0,
		letterSpacing: 0,
		rightMargin: 0,
		size: 12,
		tabStops: [],
		target: '',
		underline: false,
		url: ''
	};
	
	function getTextHTML(text, format) {
		function e(string) {
			// TODO HTML escape string
			return string;
		}

		var html = '';

		var needsTextFormat = format.blockIndent || format.indent || format.leading || format.leftMargin || format.rightMargin || (format.tabStops && format.tabStops.length);

		text.split(NEWLINE_SPLIT).forEach(function(line) {
			html += [
				// blockIndent?, indent? ?
				needsTextFormat ? [
					'<TEXTFORMAT',
						format.leftMargin ? ' LEFTMARGIN="' + e(format.leftMargin) + '"' : '',
						format.rightMargin ? ' RIGHTMARGIN="' + e(format.rightMargin) + '"' : '',
						format.indent ? ' INDENT="' + e(format.indent) + '"' : '',
						format.leading ? ' LEADING="' + e(format.leading) + '"' : '',
						format.blockIndent ? ' BLOCKINDENT="' + e(format.blockIndent) + '"' : '',
						format.tabStops && format.tabStops.length ? ' TABSTOPS="' + e(format.tabStops.join(',')) + '"' : '',
					'>'
				].join('') : '',

				// align or bullet
				format.bullet === true ? '<LI>' : [
					'<P',
						' ALIGN="', format.align.toUpperCase(), '"',
					'>'
				].join(''),

				// font, size, color, letterSpacing, kerning
				'<FONT',
					' FACE="', format.font, '"',
					' SIZE="', format.size, '"',
					' COLOR="', '#' + ('000000' + format.color.toString(16)).slice(-6), '"',
					' LETTERSPACING="', format.letterSpacing, '"',
					' KERNING="', format.kerning ? 1 : 0, '"',
				'>',

				// url?
				format.url ? [
					'<A',
						' HREF="', e(format.url), '"',
						' TARGET="', e(format.target), '"',
					'>'
				].join('') : '',

				// bold?
				format.bold ? '<B>' : '',

				// italic?
				format.italic ? '<I>' : '',

				// underline?
				format.underline ? '<U>' : '',

				e(line),

				format.underline ? '</U>' : '',
				format.italic ? '</I>' : '',
				format.bold ? '</B>' : '',
				format.url ? '</A>' : '',
				'</FONT>',
				format.bullet === true ? '</LI>' : '</P>',
				needsTextFormat ? '</TEXTFORMAT>' : ''
			].join('');
		});

		return html;
	}

	var parseTags = (function() {
		/*
		var TextSE = "[^<]+";
		var S = "[ \\n\\t\\r]+";
		var NameStrt = "[A-Za-z_:]|[^\\x00-\\x7F]";
		var NameChar = "[A-Za-z0-9_:.-]|[^\\x00-\\x7F]";
		var Name = "(" + NameStrt + ")(" + NameChar + ")*";
		var QuoteSE = '"[^"]' + "*" + '"' + "|'[^']*'";
		var MarkupDeclCE = "([^]\"'><]+|" + QuoteSE + ")*>";
		var S1 = "[\\n\\r\\t ]";
		var UntilQMs = "[^?]*\\?+";
		var PI_Tail = "\\?>|" + S1 + UntilQMs + "([^>?]" + UntilQMs + ")*>";
		var PI_CE = Name + "(" + PI_Tail + ")?";
		var EndTagCE = Name + "(" + S + ")?>?";
		var AttValSE = '"[^<"]' + "*" + '"' + "|'[^<']*'";
		var ElemTagCE = Name + "(" + S + Name + "(" + S + ")?=(" + S + ")?(" + AttValSE + "))*(" + S + ")?/?>?";
		var MarkupSPE = "<(\\?(" + PI_CE + ")?|/(" + EndTagCE + ")?|(" + ElemTagCE + ")?)";
		var XML_SPE = TextSE + "|" + MarkupSPE;
		*/

			// Inlined
			// TODO inline better (as regexp literal)
		var XML_SPE = "[^<]+|<(\\?(([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*(\\?>|[\\n\\r\\t ][^?]*\\?+([^>?][^?]*\\?+)*>)?)?|\/(([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+)?>?)?|(([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*([ \\n\\t\\r]+)?=([ \\n\\t\\r]+)?(\"[^<\"]*\"|'[^<']*'))*([ \\n\\t\\r]+)?\/?>?)?)";
		var re = new RegExp(XML_SPE, "g");

		return function(text) {
			return text.match(re) || [];
		};
	})();

	function getHTMLText(html) {
		function u(string) {
			// TODO HTML unescape string
			return string;
		}

		var text = parseTags(html).filter(function(tag) {
			return !/^</.test(tag);
		});

		return text.join('');
	}

	return createProxyClass('TextField', InteractiveObject, {
		constructor: function TextField() {
			var text = '';
			var htmlText = '';
			
				// Set the default text format to... the default text format...
			var defaultTextFormat = apply(new TextFormat(), defaultTF);

			/**
			 *
			 * .. warning::
			 *
			 *    You **must** specify a font; device fonts are not supported.
			 */
			defineGetter(this, 'defaultTextFormat', function() {
				return defaultTextFormat;
			});
			defineSetter(this, 'defaultTextFormat', function(value) {
				__cast(value, TextFormat);
				
				for(var property in value) {
					if(value[property] == null)
						continue;
					
					defaultTextFormat[property] = value[property];
				}
				
				// Fixing properties that need special requirements
				defaultTextFormat.size = Math.max(defaultTextFormat.size, 1) >>> 0;
			});

			defineGetter(this, 'htmlText', function() {
				return htmlText;
			});
			defineSetter(this, 'htmlText', function(value) {
				if(value == null)
					throw new TypeError('Parameter text must be non-null.');
				
				// FIXME: Should parse and apply all formatting

				if(htmlText === value)
					return;

					// Setting text sets HTML, but we need to get
					// the HTML's text first so... round trip!
				this.text = getHTMLText(value);
			});

			defineGetter(this, 'text', function() {
				return text.replace(/\n/g, '\r');
			});
			defineSetter(this, 'text', function(value) {
				if(value == null)
					throw new TypeError('Parameter text must be non-null.');
				
				value = String(value);
				
				text = value;
				var newHtmlText = getTextHTML(value, defaultTextFormat);
				if(newHtmlText === htmlText)
					return;

				htmlText = newHtmlText;
				var escapedHtmlText = escape(utf8_encode(newHtmlText)).replace(/[\(\)\!\*\,]/g, escape);
				send('set', this, null, 'htmlText', escapedHtmlText);
			});
		},
		patch: function patch(target, patch, mutator) {
			mutator.patchObjectProperties(target, patch, ['defaultTextFormat', 'htmlText', 'text']);
		},
		properties: {
			'autoSize': TextFormatAutoSize.NONE,
			'background': false,
			'backgroundColor': 0xffffff,
			'border': false,
			'borderColor': 0,
			'displayAsPassword': false,
			'height': 0,
			'maxChars': 0,
			'multiline': false,
			'outline': false,
			'restrict': null,
			'type': TextFieldType.DYNAMIC,
			'useFullComposer': true,
			'width': 0,
			'wordWrap': false
		},
		methods: {
			fake: {
				numLines: {
					get: function get_numLines() {
						// TODO: This does not take wordWrap into account.
						return this.text.split(NEWLINE_SPLIT).length;
					}
				},
				'getLineIndexOfChar': function getLineIndexOfChar(charIndex) {
					// TODO: This does not take wordWrap into account.
					return this.text.slice(0, charIndex).split(NEWLINE_SPLIT).length - 1;
				},
				'getLineLength': function getLineLength(lineIndex) {
					return this.getLineText(lineIndex).length;
				},
				'getLineText': function getLineText(lineIndex) {
					// TODO: This does not take wordWrap into account.
					if(lineIndex < 0 || lineIndex > this.numLines)
						throw new RangeError('The supplied index is out of bounds.');
					
					var line = this.text.split(NEWLINE_SPLIT)[lineIndex];
					if(line.length === 0)
						return '\n';
					if(lineIndex === this.numLines - 1)
						return line;
					
					return line + '\r';
				}
			}
		}
	});
});
