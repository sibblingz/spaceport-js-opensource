define('flash/transitions/easing/Linear', [], function() {
	function lerp(t, b, c, d) {
		return c*t/d + b;
	}
	
	return {
		'easeIn': lerp,
		'easeOut': lerp,
		'easeInOut': lerp
	};
});
