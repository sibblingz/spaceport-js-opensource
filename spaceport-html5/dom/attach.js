define('dom/attach', [], function() {
	return function attach(els, eventName, callback, context) {
		function handler() {
			callback.apply(context || this, arguments);
		}

		if(!(els instanceof Array))
			els = [ els ];

		els.forEach(function(el) {
			el.addEventListener(eventName, handler, false);
		});

		return {
			detach: function() {
				els.forEach(function(el) {
					el.removeEventListener(eventName, handler, false);
				});

				els = null;
			}
		};
	};
});
