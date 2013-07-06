define('dom/attachOne', [
	'dom/attach'
], function(
	attach
) {
	return function attachOne(el, eventName, callback, context) {
		var event = attach(el, eventName, function() {
			event.detach();
			callback.apply(this, arguments);
		}, context);

		return event;
	};
});
