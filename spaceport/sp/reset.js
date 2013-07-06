define('sp/reset', [
	'bridge/dictionary',
	'shared/objectKeys',
	'util/broadcast/listeners'
], function(
	dictionary,
	objectKeys,
	broadcastListeners
) {
	if(DEBUG) {
		return function reset() {
			// Clear dictionary
			var keys;
			while(true) {
				keys = objectKeys(dictionary);
				if(keys.length <= 1) {
					break;
				}

				var i;
				for(i = 0; keys[i] == 1; ++i) { // Fuzzy
					// Iterate
				}

				dictionary[keys[i]].destroy(true);
			}

			// Clear broadcast listeners
			for(var key in broadcastListeners) {
				delete broadcastListeners[key];
			}
		};
	}

	//return whatever;
});
