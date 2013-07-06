define('sp/add', [
	'e4x/e4x',
	'e4x/XML',
	'e4x/XMLList',
	'util/oop/instanceof'
], function(
	e4x,
	XML,
	XMLList,
	__instanceof
) {
	var addXML = e4x.e;

	return function add(lhs, rhs) {
		var lhsIsXML = __instanceof(lhs, XML);
		var rhsIsXML = __instanceof(rhs, XML);

		var lhsIsXMLList = __instanceof(lhs, XMLList);
		var rhsIsXMLList = __instanceof(rhs, XMLList);

		return (
			(lhsIsXML && rhsIsXML) ? addXML.aa(lhs, rhs) :
			(lhsIsXMLList && rhsIsXML) ? addXML.ba(lhs, rhs) :
			(lhsIsXML && rhsIsXMLList) ? addXML.ab(lhs, rhs) :
			(lhsIsXMLList && rhsIsXMLList) ? addXML.bb(lhs, rhs) :
			lhs + rhs
		);
	};
});
