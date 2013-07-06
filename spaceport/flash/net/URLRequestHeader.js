define('flash/net/URLRequestHeader', [
	'util/as3/inherit'
], function(
	__inherit
) {
	function URLRequestHeader(name, value) {
		this.name = name;
		this.value = value;
	}
	
	return __inherit(URLRequestHeader, Object);
});
