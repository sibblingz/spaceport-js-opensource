define('flash/ui/Mouse', [
	'util/caps/capsOf',
	'util/as3/createEnum'
], function(
	capsOf,
	__createEnum
) {
	var Mouse = __createEnum('Mouse', {
		get supportsCursor() {
			return capsOf(Mouse).supportsCursor;
		},
		get supportsNativeCursor() {
			return capsOf(Mouse).supportsNativeCursor;
		}
	});
	
	return Mouse;
});
