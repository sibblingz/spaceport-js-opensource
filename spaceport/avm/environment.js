define('avm/environment', [
	'avm/global',
	'shared/hasProperty',
	'domain/avmDomain'
], function(
	avmGlobal,
	hasProperty,
	avmDomain
) {
	function namespaceClass(type) {
		function NamespaceClass(name) {
			this.name = name;
		}

		NamespaceClass.prototype.toString = function toString() {
			return String(this.name);
		};

		NamespaceClass.prototype.type = type;

		return NamespaceClass;
	}

	var NAMESPACE_NAMESPACE        = 'namespace';
	var PACKAGE_NAMESPACE          = 'package';
	var PACKAGE_INTERNAL_NAMESPACE = 'packageInternal';
	var PROTECTED_NAMESPACE        = 'protected';
	var EXPLICIT_NAMESPACE         = 'explicit';
	var STATIC_PROTECTED_NAMESPACE = 'staticProtected';
	var PRIVATE_NAMESPACE          = 'private';

	var NamespaceNamespace       = namespaceClass(NAMESPACE_NAMESPACE);
	var PackageNamespace         = namespaceClass(PACKAGE_NAMESPACE);
	var PackageInternalNamespace = namespaceClass(PACKAGE_INTERNAL_NAMESPACE);
	var ProtectedNamespace       = namespaceClass(PROTECTED_NAMESPACE);
	var ExplicitNamespace        = namespaceClass(EXPLICIT_NAMESPACE);
	var StaticProtectedNamespace = namespaceClass(STATIC_PROTECTED_NAMESPACE);
	var PrivateNamespace         = namespaceClass(PRIVATE_NAMESPACE);

	function namespaceFactory(klass) {
		return function namespace(name) {
			return new klass(name);
		};
	}

	var ønamespaceNamespace       = namespaceFactory(NamespaceNamespace);
	var øpackageNamespace         = namespaceFactory(PackageNamespace);
	var øpackageInternalNamespace = namespaceFactory(PackageInternalNamespace);
	var øprotectedNamespace       = namespaceFactory(ProtectedNamespace);
	var øexplicitNamespace        = namespaceFactory(ExplicitNamespace);
	var østaticProtectedNamespace = namespaceFactory(StaticProtectedNamespace);
	var øprivateNamespace         = namespaceFactory(PrivateNamespace);

	function Multiname(propertyName, namespaceSet, isAttribute) {
		this.propertyName = propertyName;
		this.namespaceSet = namespaceSet;
		this.isAttribute = isAttribute;
	}

	Multiname.prototype.toString = function toString() {
		return String(this.propertyName);
	};

	function ømultiname(propertyName, namespaceSet, isAttribute) {
		return new Multiname(propertyName, namespaceSet, isAttribute);
	}

	function Scope() {
		this.pub = {}; // property string => value
		this.pac = {}; // package string => property string => value
	}

	Scope.prototype.findPropertyOne = function findPropertyOne(propertyName, ns) {
		switch(ns.type) {
		case PACKAGE_NAMESPACE:
			var pac = this.pac;
			var nsName = ns.name;
			if(hasProperty(pac, nsName)) {
				var packageProperties = pac[nsName];
				if(hasProperty(packageProperties, propertyName)) {
					// Found it
					return [packageProperties[propertyName]];
				}
			}
			break;

		default:
			// NOT IMPLEMENTED
			// TODO
			console.warn("Multiname of type " + ns.type + " not supported");
			return null;
		}
	};

	Scope.prototype.findProperty = function findProperty(name) {
		if(!(name instanceof Multiname)) {
			var pub = this.pub;
			if(hasProperty(pub, name)) {
				return [pub[name]];
			} else {
				return null;
			}
		}

		var propertyName = name.propertyName;
		var pac = this.pac;

		// FIXME Is this the correct priority?
		var nss = name.namespaceSet;
		for(var i = 0; i < nss.length; ++i) {
			var found = this.findPropertyOne(propertyName, nss[i]);
			if(found) {
				return found;
			}
		}

		// Fall back to public namespace
		// FIXME Is this correct behaviour?
		var pub = this.pub;
		if(hasProperty(pub, propertyName)) {
			return [pub[propertyName]];
		}

		// Failure
		return null;
	};

	var øglobal = new Scope();
	øglobal.pub = avmGlobal;

	øglobal.findPropertyOne = function findPropertyOne(propertyName, ns) {
		switch(ns.type) {
		case PACKAGE_NAMESPACE:
			var nsName = ns.name;
			var c = avmDomain.getClass(ns.name + '::' + propertyName);
			return c === null ? null : [c];

		default:
			// NOT IMPLEMENTED
			// TODO
			console.warn("Multiname of type " + ns.type + " not supported");
			return null;
		}
	};

	function flattenScopeStack(scopeStack) {
		function flatten(xs) {
			if(Array.isArray(xs)) {
				return xs.reduce(function(acc, x) {
					return acc.concat(flatten(x));
				}, [ ]);
			} else {
				return xs;
			}
		}

		return flatten(scopeStack).concat([ øglobal ]);
	}

	// Returns an array containing the found property value on success,
	// or null on failure.
	// (wtb Maybe a)
	function findLexProperty(name, scope) {
		if(scope instanceof Scope) {
			return scope.findProperty(name);
		} else {
			if(name in scope) {
				return [scope[name]];
			} else {
				return null;
			}
		}
	}

	function øfindLexProperty(isStrict, name, scopeStack) {
		scopeStack = flattenScopeStack(scopeStack);

		for(var i = 0; i < scopeStack.length; ++i) {
			var scope = scopeStack[i];
			var found = findLexProperty(name, scope);
			if(found) {
				return scope;
			}
		}

		if(isStrict) {
			throw new ReferenceError("Failed to findLexProperty " + name);
		} else {
			return øglobal;
		}
	}

	function øgetLexProperty(isStrict, name, scopeStack) {
		scopeStack = flattenScopeStack(scopeStack);

		for(var i = 0; i < scopeStack.length; ++i) {
			var scope = scopeStack[i];
			var found = findLexProperty(name, scope);
			if(found) {
				return found[0];
			}
		}

		if(isStrict) {
			throw new ReferenceError("Failed to getLexProperty " + name);
		} else {
			// FIXME
			return øglobal;
		}
	}

	function ølookUp(obj, prop) {
		if(obj instanceof Scope) {
			var found = obj.findProperty(prop);
			if(found) {
				return found[0];
			} else {
				return /* undefined */;
			}
		} else {
			return obj[prop];
		}
	}

	function øobject(obj /* k, v, k, v, ... */) {
		var i = 1;
		while(i < arguments.length) {
			var k = arguments[i + 0];
			var v = arguments[i + 1];
			obj[k] = v;
			i += 2;
		}
		return obj;
	}

	function environment() {
		return [
			ønamespaceNamespace,
			øpackageNamespace,
			øpackageInternalNamespace,
			øprotectedNamespace,
			øexplicitNamespace,
			østaticProtectedNamespace,
			øprivateNamespace,
			ømultiname,
			øglobal,
			øfindLexProperty,
			øgetLexProperty,
			ølookUp,
			øobject
		];
	}

	return environment;
});
