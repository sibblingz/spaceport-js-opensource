define('flash/display/FrameLabel', [
	'shared/defineReadOnly',
	'util/as3/inherit'
], function(
	defineReadOnly,
	__inherit
) {
	function FrameLabel(name, frame) {
		defineReadOnly(this, 'name', name);
		defineReadOnly(this, 'frame', frame);
	}
	
	return __inherit(FrameLabel, Object);
});
