define('dom/checkedSetAttribute', [], function() {
	return function checkedSetAttribute(el, name, value) {
		value += "";
		if(el.getAttribute(name) !== value)
			el.setAttribute(name, value);
	};
});
