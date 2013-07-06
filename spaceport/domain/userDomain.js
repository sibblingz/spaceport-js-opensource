define('domain/userDomain', [
	'domain/Domain'
], function(
	Domain
) {
	// User-defined classes (using sp.Class) go here.
	return new Domain('user');
});
