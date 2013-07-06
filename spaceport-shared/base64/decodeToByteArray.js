define('shared/base64/decodeToByteArray', [
	'shared/base64/decodeToArray',
	'flash/utils/ByteArray'
], function(
	base64DecodeToArray,
	ByteArray
) {
	return function base64DecodeToByteArray(string) {
		return new ByteArray((new Uint8Array(base64DecodeToArray(string))).buffer);
	};
});
