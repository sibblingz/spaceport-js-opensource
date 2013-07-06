define('bridge/send', [
	'buffer'
], function(
	buffer
) {
	return function send(target, event, extraInfo) {
		var obj = { target: target.id };
		if(event)
			obj.event = event;
		if(extraInfo)
			obj.extraInfo = extraInfo;
		buffer.push(obj);
	};
});
