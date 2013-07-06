define('sp', [
	'util/builtin/slice',
	'shared/apply',

	'domain/mainDomain',
	'domain/flashDomain',
	'domain/ecmaDomain',
	'domain/avmDomain',
	'plugin/pluginDomain',
	'domain/userDomain',

	'sp/import',
	'sp/reset',

	// Normal things on sp. (not in mainDomain)
	'e4x/XML',
	'e4x/XMLList',

	'plugin/registerPlugin',

	'sp/Class',
	'sp/Dictionary',
	'sp/Interface',
	'sp/PNGEncoder',
	'sp/add',
	'sp/args',
	'sp/as',
	'sp/contains',
	'sp/createContext',
	'sp/eq',
	'sp/get',
	'sp/implicitCoerce',
	'sp/init',
	'sp/is',
	'sp/keys',
	'sp/mkPropHandle',
	'sp/mkWithHandle',
	'sp/normalizeKey',
	'sp/preconstructInstance',
	'sp/set',
	'sp/shouldStringifyKey',
	'sp/superOf',
	'sp/toInt',
	'sp/toUint',
	'sp/trace',
	'sp/typeOf',
	'sp/unset',
	'sp/values',
], function(slice, apply, mainDomain, flashDomain, ecmaDomain, avmDomain, pluginDomain, userDomain, _import, _reset) {
	mainDomain.addDomain(ecmaDomain);
	mainDomain.addDomain(flashDomain);
	mainDomain.addDomain(pluginDomain);
	mainDomain.addDomain(userDomain);
	avmDomain.addDomain(flashDomain);

	var args = slice.call(arguments, 10);
	var argNames = [
		'XML',
		'XMLList',

		'registerPlugin',

		'Class',
		'Dictionary',
		'Interface',
		'PNGEncoder',
		'add',
		'args',
		'as',
		'contains',
		'createContext',
		'eq',
		'get',
		'implicitCoerce',
		'init',
		'is',
		'keys',
		'mkPropHandle',
		'mkWithHandle',
		'normalizeKey',
		'preconstructInstance',
		'set',
		'shouldStringifyKey',
		'superOf',
		'toInt',
		'toUint',
		'trace',
		'typeOf',
		'unset',
		'values',
	];

	// Global functions and helpers (e.g. sp.superOf)
	var sp = argNames.reduce(function(acc, argName, index) {
		acc[argName] = args[index];
		return acc;
	}, {
		// Sub-namespaces (e.g. sp.filters.BlurFilter)
		'easing': _import('flash.transitions.easing.*'),
		'filters': _import('flash.filters.*')
	});

	if(DEBUG) {
		sp._reset = _reset;
	}

	// Global classes (e.g. sp.MovieClip)
	var spPackages = 'display,errors,events,geom,media,net,sensors,system,text,ui,utils,transitions'
		.split(',');
	return spPackages.reduce(function(acc, packageName) {
		return apply(acc, _import('flash.' + packageName + '.*'));
	}, sp);
});
