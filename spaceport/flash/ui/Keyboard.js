define('flash/ui/Keyboard', [
	'shared/apply',
	'util/caps/capsOf',
	'util/as3/createEnum'
], function(
	apply,
	capsOf,
	__createEnum
) {
	/*
	 * This is an extremely compressed version of the object literal found in
	 * automated_tests/javascript/Keyboard/Keyboard.js. (When touching this,
	 * *please test using that file*.)
	 *
	 * It works by reversing the object to be value => key mappings. Since keys
	 * are integers, the values are packed in an array.
	 *
	 * For example, the object:
	 * { 'a': 1, 'b': 3, 'c': 8, 'd': 4 }
	 * is packed as:
	 * [ undefined, 'a', undefined, 'b', 'd', undefined, undefined, undefined, 'c' ]
	 *
	 * We further compress this by packing it as a string and splitting:
	 * ',a,bd,,,c'.split(',')
	 *
	 * We then remove those values which contains numbers (so the next step
	 * works properly), and generate them in a later loop. Only NUMBER, NUMPAD,
	 * and F keys contain numbers, so it's easy to optimize these into a single
	 * loop.
	 *
	 * After the numbers are removed, we replace strings of commas with
	 * numbers, and unpack them as a series of commas so splitting works:
	 * '1a1bd3c'.replace(...).split(',')
	 *
	 * I have tried extracting the 'NUMPAD_' string (used several times) out,
	 * with no success (larger output).
	 *
	 * Reversing the looping order may work; will need to investigate this.
	 */
	var keyboard = {}, i = 0;

	for(
		'8BACKSPACE1TAB4ENTER2COMMAND1SHIFT1CONTROL1ALTERNATE2CAPS_LOCK1NNUMPAD6ESCAPE5SPACE1PAGE_UP1PAGE_DOWN1END1HOME1LEFT1UP1RIGHT1DOWN5INSERT1DELETE19A1B1C1D1E1F1G1H1I1J1K1L1M1N1O1P1Q1R1S1T1U1V1W1X1Y1Z16NUMPAD_MULTIPLY1NUMPAD_ADD1NUMPAD_ENTER1NUMPAD_SUBTRACT1NUMPAD_DECIMAL1NUMPAD_DIVIDE75SEMICOLON1EQUAL1COMMA1MINUS1PERIOD1SLASH1BACKQUOTE27LEFTBRACKET1BACKSLASH1RIGHTBRACKET1QUOTE'
			.replace(/\d+/g, function(count) {
				return Array(++count);
			}).split(',').map(function(key, value) {
				if(key)
					keyboard[key] = value;
			});
		i < 15;
		keyboard['F' + i] = i + 111
	) {
		if(i < 10) {
			keyboard['NUMBER_' + i] = i + 48;
			keyboard['NUMPAD_' + i] = i + 96;
		}

		++i;
	}

	var Keyboard = __createEnum('Keyboard', apply(keyboard, {
		get hasVirtualKeyboard() {
			return capsOf(Keyboard).hasVirtualKeyboard;
		},
		get physicalKeyboardType() {
			return capsOf(Keyboard).physicalKeyboardType;
		}
	}));
	
	return Keyboard;
});
