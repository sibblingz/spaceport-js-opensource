define('flash/events/HTTPStatusEvent', [
	'util/as3/eventBuilder',
	'util/numberDefault',
	'flash/net/URLRequestHeader'
], function(
	eventBuilder,
	__number_default,
	URLRequestHeader
) {
	var HTTPStatusEvent = eventBuilder('HTTPStatusEvent', {
		args: ['status', 'responseURL' /*, 'responseHeaders'*/ ],
		constructor: function ProgressEvent(type, bubbles, cancelable, status) {
			this.status = __number_default(status, 0);

			this.responseURL = null;
			this.responseHeaders = [];
		},
		events: {
//			HTTP_RESPONSE_STATUS: 'httpResponseStatus',
			HTTP_STATUS: 'httpStatus'
		},
		build: function build(patch) {
			var result = new HTTPStatusEvent(
				patch.type,
				patch.bubbles,
				patch.cancelable,
				patch.status
			);
			
			result.responseURL = patch.responseURL;
			result.responseHeaders = [].concat(patch.responseHeaders || []).map(function(httpRequestHeader) {
				return new URLRequestHeader(httpRequestHeader.name, httpRequestHeader.value);
			});
			
			return result;
		}
	});
	
	return HTTPStatusEvent;
});
