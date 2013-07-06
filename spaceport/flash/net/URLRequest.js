define('flash/net/URLRequest', [
	'flash/net/URLVariables',
	'flash/net/URLRequestMethod',
	'proxy/ISpaceportSerializable',
	'shared/base64/encode',
	'shared/defineGetter',
	'shared/defineSetter',
	'util/oop/instanceof',
	'util/constructRef',
	'util/as3/geomToString',
	'util/as3/inherit',
	'bridge/escape'
], function(
	URLVariables,
	URLRequestMethod,
	ISpaceportSerializable,
	base64Encode,
	defineGetter,
	defineSetter,
	__instanceof,
	__construct_ref,
	__as3_toString,
	__inherit,
	bufferEscape
) {
	var validMethods = [
		URLRequestMethod.GET,
		URLRequestMethod.POST
	];
	
	function URLRequest(url) {
		this.url = url;
		this.data = null;
		
		var method = 'GET';
		defineGetter(this, 'method', function() {
			return method;
		});
		defineSetter(this, 'method', function(value) {
			value = String(value);
			if(validMethods.indexOf(value) === -1)
				throw new Error('Parameter method must be one of the accepted values.');
				
			method = value;
		});
		
		var headers = [];
		defineGetter(this, 'requestHeaders', function() {
			return headers.concat();
		});
		defineSetter(this, 'requestHeaders', function(value) {
			// TODO: Type checking
			headers = value;
		});
	};
	
	return __inherit(URLRequest, ISpaceportSerializable, {
		'nativeSerialize': function nativeSerialize() {
			var parts = [
				this.method,
				bufferEscape(this.url)
			];
			
			if(this.requestHeaders) {
				parts.push(base64Encode(this.requestHeaders.map(function(header) {
					return header.name + ': ' + header.value;
				}).join('\r\n')));
			} else {
				parts.push(null);
			}

			if(this.method === 'GET') {
				if(this.data != null) {
					if(this.url.indexOf('?') === -1)
						parts[1] += '?';
				
					parts[1] += bufferEscape(this.data.toString());
				}
			} else {
				if(__instanceof(this.data, ISpaceportSerializable))
					parts.push(this.data.nativeSerialize());
				else if(this.data)
					parts.push(base64Encode(this.data.toString()));
			}
			
			return __construct_ref('URLRequest', parts);
		}
	});
});
