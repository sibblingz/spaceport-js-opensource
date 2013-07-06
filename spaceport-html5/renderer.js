define('renderer', [
	'bridge/flush',
	'display/ShapeDisplayList'
], function(
	flush,
	ShapeDisplayList
) {
	return {
		slowMode: function slowMode() {
			// XXX Obviously temporary XXX
			ShapeDisplayList.prototype.isPureSvg = function isPureSvg() {
				return true;
			};
		},
		fastMode: function fastMode() {
			// XXX Obviously temporary XXX
			ShapeDisplayList.prototype.isPureSvg = function isPureSvg() {
				return false;
			};
		},
		flush: flush
	};
});
