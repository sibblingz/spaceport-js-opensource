define('dom/checkedSetStyle', [], function() {
	return function checkedSetStyle(el, name, value) {
		value += "";
		if(el.style[name] !== value)
			el.style[name] = value;
	};
});
