define('flash/URLLoader', [
	'bridge/send',
	'shared/base64/encode',
	'util/lightClass'
], function(
	send,
	base64_encode,
	lightClass
) {
	var URLLoader = lightClass({
		constructor: function URLLoader() {
		},
		'load': function load(request) {
			// TODO Validate request variables!!!

			var self = this;
			var xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function() {
				if(xhr.readyState === 4) {
					// TODO check status

					var data = xhr.responseText;

					send(self, {
						$: 'Event',
						type: 'complete',
						bubbles: false,
						cancelable: false
					}, {
						data: base64_encode(data)
					});
				}
			};

			xhr.open(request.method, request.url);
			xhr.send();
		}
	});

	return URLLoader;
});
