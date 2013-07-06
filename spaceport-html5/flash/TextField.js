define('flash/TextField', [
	'flash/InteractiveObject',
	'display/TextDisplayList',
	'util/lightClass',
	'shared/objectKeys',
	'dom/jvoNS'
], function(
	InteractiveObject,
	TextDisplayList,
	lightClass,
	objectKeys,
	jvoNS
) {
	function parseHTML(htmlText) {
		var dom = document.createElement('div');
		dom.innerHTML = htmlText;
		return Array.prototype.slice.call(dom.childNodes);
	}

	var TextField = lightClass(InteractiveObject, {
		constructor: function TextField(bounds) {
			bounds = bounds || [0, 0, 0, 0];

			this.displayList = new TextDisplayList(bounds);
			this.bounds = bounds;

			this.defaultTextFormat = null;

			this._htmlText = '';
			this.updateDisplayList();
		},
		'isEventTarget': false,
		'htmlText': {
			get: function get_htmlText() {
				return this._htmlText;
			},
			set: function set_htmlText(value) {
				this._htmlText = unescape(value);
				this.updateDisplayList();
			}
		},
		'updateDisplayList': function updateDisplayList() {
			this.displayList.updateDom(parseHTML(this._htmlText));
		},
		'writeDescriptor': function writeDescriptor(object) {
			InteractiveObject.prototype.writeDescriptor.call(this, object);
			object.$ = 'TextField';
			object.htmlText = this.htmlText;
			object.bounds = this.bounds.slice();
			if(this.defaultTextFormat)
				object.defaultTextFormat = this.defaultTextFormat;
		},
		'cloneInto': function cloneInto(object) {
			InteractiveObject.prototype.cloneInto.call(this, object);
			object.bounds = this.bounds.slice();
			object.htmlText = this.htmlText;
			object.defaultTextFormat = this.defaultTextFormat;
		},
		'clone': function clone() {
			var cloned = new TextField(this.bounds);
			this.cloneInto(cloned);
			this.displayList.copyEffectsTo(cloned.displayList);
			return cloned;
		},
		'width': {
			set: function set_width(width) {
				// TODO
			}
		},
		'height': {
			set: function set_height(height) {
				// TODO
			}
		}
	});

	TextField.fromElement = function fromElement(element) {
		// JVO name => TextFormat name
		var textFormatProps = {
			'fontName': 'font',
			'fontSize': 'size',
			'color': 'color',
			'bold': 'bold',
			'italic': 'italic',
			'underline': 'underline',
			'url': 'url',
			'target': 'target',
			'align': 'align',
			'leftMargin': 'leftMargin',
			'rightMargin': 'rightMargin',
			'indent': 'indent',
			'leading': 'leading',

			'blockIndent': 'blockIndent',
			'bullet': 'bullet',
			'kerning': 'kerning',
			'letterSpacing': 'letterSpacing',
			'tabStops': 'tabStops'
		};

		var textFormat = { $: 'TextFormat' };
		objectKeys(textFormatProps).forEach(function(key) {
			if(element.hasAttributeNS(jvoNS, key))
				textFormat[textFormatProps[key]] = element.getAttributeNS(jvoNS, key);
		});

		if('color' in textFormat)
			textFormat.color = parseInt(textFormat.color /* */);

		var viewBox = element.viewBox.baseVal;
		var textField = new TextField([viewBox.x, viewBox.y, viewBox.width, viewBox.height]);
		textField.htmlText = element.textContent;
		textField.defaultTextFormat = textFormat;

		return textField;
	};

    return TextField;
});
