define('sp/superOf', [
	'util/oop/getPrototypeOf',
	'shared/lookupGetter',
	'shared/lookupSetter',
	'shared/defineGetter',
	'shared/defineSetter',
	'shared/hasProperty'
], function(
	getPrototypeOf,
	lookupGetter,
	lookupSetter,
	defineGetter,
	defineSetter,
	hasProperty
) {
	function findCallingPrototype(proto, caller) {
		// Walk up the prototype chain, finding a function which is present in
		// the call stack.
		var checked = []; // Recursion check
		var fn = caller;
		while(fn && checked.indexOf(fn) < 0) {
			checked.push(fn);

			var curProto = proto;
			while(curProto && curProto !== Object.prototype) {
				for(var key in curProto) {
					if(hasProperty(curProto, key)) {
						var getter = lookupGetter(curProto, key);
						if((getter || curProto[key]) === fn) {
							return curProto;
						}
					}
				}

				curProto = getPrototypeOf(curProto);
			}

			fn = fn.caller;
		}

		return proto;
	}

	// TODO: More efficient version using Proxy where supported

	function createSuperOfObject(instance, superProto) {
		var superObject = {};
		for(var key in superProto) {
			// We do want to walk prototype;
			// no hasOwnProperty or Object.keys here
			(function(key) {
				var getter = lookupGetter(superProto, key);
				var setter = lookupSetter(superProto, key);

				if(getter || setter) {
					if(getter) {
						defineGetter(superObject, key, getter.bind(instance));
					}
					if(setter) {
						defineSetter(superObject, key, setter.bind(instance));
					}
				} else {
					defineGetter(superObject, key, function() {
						var value = key in superProto ? superProto[key] : instance[key];
						if(typeof value === 'function') {
							// [PARANOID] Use prototype in case user overwrote bind
							return Function.prototype.bind.call(value, instance);
						} else {
							return value;
						}
					});

					defineSetter(superObject, key, function(value) {
						instance[key] = value;
					});
				}
			}(key));
		}

		defineGetter(superObject, 'constructor', function() {
			return superProto.constructor.bind(instance);
		});

		defineGetter(superObject, 'constructorArgs', function() {
			return function superConstructorArgs(args) {
				return superProto.constructor.apply(instance, args);
			};
		});

		return superObject;
	}

	return function superOf(instance, superClass) {
		var superProto;
		if (typeof superClass === 'function') {
			superProto = superClass.prototype;
		} else {
			superProto = getPrototypeOf(
				findCallingPrototype(
					getPrototypeOf(instance),
					superOf.caller
				)
			);
		}

		return createSuperOfObject(instance, superProto);
	};
});
