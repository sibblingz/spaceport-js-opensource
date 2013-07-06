define('dom/checkedSetStyleCached', [], function() {
	return function checkedSetStyleCached(el, key, name, value) {
		value += "";
		if(el[key] !== value) {
			el[key] = value;
			el.style[name] = value;
		}
	};
});
