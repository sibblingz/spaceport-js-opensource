define('sp/Interface', [
	'spmetadata',
	'sp/is',
	'util/error/coercionFailed',
	'util/as3/makeClassToString',
	'util/as3/makeFQN',
	'util/as3/fqnToClassName',
	'util/as3/inherit',
	'util/js/nameFunction',
	'util/oop/instanceof'
], function(
	SPMETADATA,
	is,
	coercionFailed,
	makeClassToString,
	makeFQN,
	fqnToClassName,
	__inherit,
	nameFunction,
	__instanceof
) {
	return {
		'create': function Interface_create(fqn, extendsInterfaces) {
			fqn = makeFQN(fqn);
			var name = fqnToClassName(fqn);

			var iface = nameFunction(name, function(x) {
				if(__instanceof(this, iface)) {
					// new iface(...)
					// VerifyError: Error #1001: The method IGoable() is not implemented.
					throw new Error("The method " + name + "() is not implemented.");
				}

				if(!is(x, iface)) {
					coercionFailed(x, name);
				}

				return x;
			});

			__inherit(iface, Object, {});

			iface[SPMETADATA] = {
				'fqn': fqn,
				'implements': [],
				'extends': extendsInterfaces ? extendsInterfaces.slice() : [],
				'interface': true
			};

			return iface;
		}
	};
});
