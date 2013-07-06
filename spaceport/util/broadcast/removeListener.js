define('util/broadcast/removeListener', [
	'util/broadcast/listeners'
], function(
	broadcastListeners
) {
	return function removeBroadcastListener(type, instance) {
		var idx = broadcastListeners[type].indexOf(instance);
		if(idx !== -1 && !instance.hasEventListener(type))
			broadcastListeners[type].splice(idx, 1);
	
		if(!broadcastListeners[type].length)
			delete broadcastListeners[type];
	};
});
