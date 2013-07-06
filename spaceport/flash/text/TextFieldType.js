define('flash/text/TextFieldType', [
	'util/as3/createEnum'
], function(
	createEnum
) {
	return createEnum('TextFieldType', {
		DYNAMIC: 'dynamic',
		INPUT: 'input'
	});
});
