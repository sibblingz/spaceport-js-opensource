define('util/stringSimilarity', [], function() {
	return function stringSimilarity(a, b) {
		// Very hackish similarity algorithm

		// Convert "constructor" into
		// /^.*?(c?).*?(o?).*?(n?).*?(s?).*?(t?).*?(r?).*?(u?).*?(c?).*?(t?).*?(o?).*?(r?).*?$/
		// and return how many groups were matched
		var re = new RegExp('^.*?' + a.split('').map(function(letter, index) {
			return '(' + letter + '?).*?';
		}).join('') + '$');
		return re.exec(b).filter(function(x) { return x; }).length;
	};
});
