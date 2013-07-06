// asJam runtime entry point; must be compatible with Node.js
define('node', [
	'util/builtin/slice',

	'sp/Class',
	'sp/trace',
	'sp/toInt',
	'sp/toUint',
	'sp/is',
	'sp/as',
	'sp/superOf',
	'sp/args',

	'e4x/XML',
	'e4x/XMLList',

	'flash/utils/getQualifiedClassName',
	'flash/utils/getDefinitionByName',
	'flash/utils/getTimer',
	'flash/utils/setTimeout',
	'flash/utils/setInterval',
	'flash/utils/clearTimeout',
	'flash/utils/clearInterval',
], function(slice) {
	var args = slice.call(arguments, 1);
	var argNames = (
		'Class,trace,toInt,toUint,is,as,superOf,args,XML,XMLList,' +
		'getQualifiedClassName,getDefinitionByName,getTimer,setTimeout,setInterval,clearTimeout,clearInterval'
	).split(',');

	var sp = argNames.reduce(function(acc, argName, index) {
		acc[argName] = args[index];
		return acc;
	}, {});

	if(typeof module !== 'undefined') {
		module.exports = sp;
	}

	return sp;
});
