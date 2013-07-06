define('flash/transitions/easing/Sine', [], function() {
	return {
		'easeIn': function easeIn(t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		'easeOut': function easeOut(t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		'easeInOut': function easeInOut(t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		}
	};
});
