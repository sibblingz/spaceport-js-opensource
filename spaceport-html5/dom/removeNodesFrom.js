define('dom/removeNodesFrom', [], function() {
	return function removeNodesFrom(node) {
		if(!node) {
			return;
		}

		var parent = node.parentNode;
		while(node) {
			var n = node.nextSibling;
			parent.removeChild(node);
			node = n;
		}
	};
});
