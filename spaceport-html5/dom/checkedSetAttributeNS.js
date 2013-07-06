define('dom/checkedSetAttributeNS', [], function() {
	return function checkedSetAttributeNS(el, ns, name, value) {
		value += "";
		if(el.getAttributeNS(ns, name) !== value)
			el.setAttributeNS(ns, name, value);
	};
});
