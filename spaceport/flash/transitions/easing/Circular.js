define('flash/transitions/easing/Circular', [], function() {
	return {
		'easeIn': function easeIn(t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		'easeOut': function easeOut(t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		'easeInOut': function easeInOut(t, b, c, d) {
			if ((t/=d/2) < 1)
				return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		}
	};
});
