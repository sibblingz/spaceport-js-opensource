define('util/broadcast/addListener', [
	'util/broadcast/listeners'
], function(
	broadcastListeners
) {
	return function addBroadcastListener(type, instance) {
		if(!broadcastListeners[type])
			broadcastListeners[type] = [];
	
		if(broadcastListeners[type].indexOf(instance) === -1)
			broadcastListeners[type].push(instance);
	};
});
