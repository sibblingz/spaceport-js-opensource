define('flash/transitions/easing/Bounce', [], function() {
	function easeOut(t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	}
	
	function easeIn(t, b, c, d) {
		return c - easeOut (d-t, 0, c, d) + b;
	}
	
	function easeInOut(t, b, c, d) {
		if (t < d/2)
			return easeIn(t*2, 0, c, d) * .5 + b;
		
		return easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
	
	return {
		'easeIn': easeIn,
		'easeOut': easeOut,
		'easeInOut': easeInOut
	};
});
