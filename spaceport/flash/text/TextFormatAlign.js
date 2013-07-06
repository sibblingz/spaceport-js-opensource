define('flash/text/TextFormatAlign', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('TextFormatAlign', {
		LEFT: 'left',
		CENTER: 'center',
		RIGHT: 'right',
		JUSTIFY: 'justify'
	});
});
