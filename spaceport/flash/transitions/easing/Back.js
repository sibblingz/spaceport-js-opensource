define('flash/transitions/easing/Back', [
	'util/numberDefault'
], function(
	__number_default
) {
	return {
		'easeIn': function easeIn(t, b, c, d, s) {
			s = __number_default(s, 1.70158);
			
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		'easeOut': function easeOut(t, b, c, d, s) {
			s = __number_default(s, 1.70158);
			
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		'easeInOut': function easeInOut(t, b, c, d, s) {
			s = __number_default(s, 1.70158);
			
			if ((t/=d/2) < 1)
				return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		}
	};
});
