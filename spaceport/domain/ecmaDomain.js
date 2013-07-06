define('domain/ecmaDomain', [
	'domain/Domain',
	'e4x/XML',
	'e4x/XMLList'
], function(
	Domain,
	XML,
	XMLList
) {
	var ecmaDomain = new Domain('ECMA');
	ecmaDomain.classes['XML'] = XML;
	ecmaDomain.classes['XMLList'] = XMLList;
	return ecmaDomain;
});
