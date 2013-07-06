define('flash/transitions/easing/Quadratic', [], function() {
	return {
		'easeIn': function easeIn(t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		'easeOut': function easeOut(t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		'easeInOut': function easeInOut(t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		}
	};
});
