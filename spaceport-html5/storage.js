define('storage', [], function() {
	var localStorage = window.localStorage;
	var localStorageKey = 'spaceport_html5_local_storage';

	var localStorageData = (function() {
		try {
			var data = JSON.parse(localStorage.getItem(localStorageKey));
			if(typeof data === 'object' && data) {
				return data;
			}
		} catch(e) {
			// Fall through
		}

		return {};
	}());

	// cloneObject = JSON.parse . JSON.stringify  -- kthx
	function cloneObject(x) {
		return JSON.parse(JSON.stringify(x));
	}

	return {
		set: function setStorage(key, value) {
			localStorageData[key] = value;
			localStorage.setItem(localStorageKey, JSON.stringify(localStorageData));
		},

		getAll: function getAllStorage() {
			return cloneObject(localStorageData);
		}
	};
});
