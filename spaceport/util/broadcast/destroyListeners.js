define('util/broadcast/destroyListeners', [
	'util/broadcast/listeners'
], function(
	broadcastListeners
) {
    return function destroyListeners(instance) {
        for(var key in broadcastListeners) {
            var listeners = broadcastListeners[key];
            var index = listeners.indexOf(instance);
            if(index >= 0) {
                listeners.splice(index, 1);
            }

            if(!listeners.length) {
                delete broadcastListeners[key];
            }
        }
    };
});
