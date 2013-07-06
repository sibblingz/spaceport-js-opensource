define('flash/net/URLLoader', [
	'proxy/create',
	'flash/events/EventDispatcher',
	'shared/base64/decodeToString',
	'shared/base64/decodeToByteArray',
	'util/loaderPatcher',
	'flash/net/URLRequest',
	'flash/net/URLVariables',
	'flash/utils/ByteArray',
	'flash/net/URLLoaderDataFormat'
], function(
	createProxyClass,
	EventDispatcher,
	base64DecodeToString,
	base64DecodeToByteArray,
	loaderPatcher,
	URLRequest,
	URLVariables,
	ByteArray,
	URLLoaderDataFormat
) {
	return createProxyClass('URLLoader', EventDispatcher, {
		constructor: function URLLoader() {
			this.data = null;
			this.dataFormat = 'text';
		},
		patch: function patch(target, patch, mutator) {
			loaderPatcher(target, patch, mutator);
			
			if(typeof patch.data === 'string') {
				if(target.dataFormat === URLLoaderDataFormat.BINARY) {
					target.data = base64DecodeToByteArray(patch.data);
				} else {
					target.data = base64DecodeToString(patch.data);
					
					if(target.dataFormat === URLLoaderDataFormat.VARIABLES)
						target.data = new URLVariables(target.data);
				}
			}
		},
		methods: {
			real: {
				'load': [URLRequest]
//				'close': []
			}
		}
	});
});
