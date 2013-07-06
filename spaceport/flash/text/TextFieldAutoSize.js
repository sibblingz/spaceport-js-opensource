define('flash/text/TextFieldAutoSize', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('TextFieldAutoSize', {
		CENTER: 'center',
		LEFT: 'left',
		NONE: 'none',
		RIGHT: 'right'
	});
});
