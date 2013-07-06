define('flash/ui/KeyboardType', [
	'util/as3/createEnum'
], function(
	__createEnum
) {
	return __createEnum('KeyboardType', {
		ALPHANUMERIC: "alphanumeric",
 	 	KEYPAD: "keypad",
 	 	NONE: "none"
	});
});
