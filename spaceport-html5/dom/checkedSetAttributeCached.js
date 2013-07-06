define('dom/checkedSetAttributeCached', [], function() {
	return function checkedSetAttributeCached(el, key, name, value) {
		value += "";
		if(el[key] !== value) {
			el[key] = value;
			el.setAttribute(name, value);
		}
	};
});
