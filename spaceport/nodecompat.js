define('nodecompat', [
	'shared/hasProperty',
	'util/builtin/slice',
	'shared/defineProperty',
	'util/builtin/functionPrototype',
	'shared/applyNonEnumerable'
], function(
	hasProperty,
	slice,
	defineProperty,
	funcProto,
	applyNonEnumerable
) {
	// Be careful when including modules; they should not depend on nodecompat features!
	function emptyFunction() {
		// Empty
	}
	
	function isArray(obj) {
		return Object.prototype.toString.apply(obj) === '[object Array]';
	}

	/**
	 * IE9 support for Function.name
	 */
	if(!('name' in funcProto)) {
		defineProperty(funcProto, 'name', {
			enumerable: false,
			configurable: false,
			get: function() {
				var name = funcProto.toString.call(this).substr('function'.length);
				return name.substr(0, name.indexOf('(')).replace(/ /g, '');
			}
		});
	}
	
	if(typeof Object.keys !== 'function') {
		Object.keys = function keys(object) {
			if(object !== Object(object))
				throw new TypeError('Object.keys called on non-object');
			
			var ret = [];
			for(var property in object) {
				if(hasProperty(object, property))
					ret.push(property);
			}
			
			return ret;
		};
	}

	if(typeof Object.create !== 'function') {
		Object.create = function create(object, properties) {
			if(typeof object !== 'object') {
				throw new TypeError(); // FIXME
			}

			function F() { }
			F.prototype = object;

			var o = new F();
			if(typeof properties !== 'undefined') {
				defineProperties(o, properties);
			}
			return o;
		}
	}

	if(typeof Object.getPrototypeOf !== 'function') {
		Object.getPrototypeOf = function getPrototypeOf() {
			return obj.__proto__;
		};
	}

	function bindFunction(thisObject) {
		var method = this;
		var args = slice.call(arguments, 1);

		// We must maintain the resulting function's .length
		// property.
		var argNames = [];
		for(var i = 0; i < this.length; ++i) {
			argNames.push('_' + i);
		}

		// m = method
		// t = thisObject
		// a = args
		// s = slice
		var fnText = '(function(m,t,a,s){return function(' + argNames.join(',') + '){'
			+ 'return m.apply(t, a.concat(s.call(arguments)));'
			+ '}})';
		return eval(fnText)(method, thisObject, args, slice);
	}

	var supportsProperBind
		= typeof funcProto.bind === 'function'
		&& (function(a, b, c) { }).bind({ }).length === 3;
	if(!supportsProperBind) {
		applyNonEnumerable(funcProto, { bind: bindFunction });
	}

	if(typeof Array.isArray !== 'function') {
		Array.isArray = isArray;
	}

		// JSON.parse, JSON.stringify
	if(typeof window !== 'undefined') {
		window.console = window.console || {
			log: emptyFunction,
			warn: emptyFunction,
			error: emptyFunction,
			debug: emptyFunction,
			info: emptyFunction,
			trace: emptyFunction
		};
		
		window.JSON = window.JSON || {
			stringify: function stringify(obj) {
				if(typeof obj.valueOf === 'function')
					obj = obj.valueOf();
			
					// Invalid cases
				if(typeof obj === 'function')
					throw new Error("JSON does not support functions");
			
					// Numbers and booleans are self-JSONising
				if(typeof obj === 'number' || typeof obj === 'boolean')
					return obj.toString();
				
					// Strings needs to be escaped
				if(typeof obj === 'string') {
					return '"' + obj.replace(/"/g, '\\\"').replace(/[^\x20-\x80]/g, function(result) {
						return '\\u' + ('0000' + result.charCodeAt(0).toString(16)).slice(-4);
					}) + '"';
				}
				
					// null is 'null'
				if(obj === null)
					return 'null';
				
					// Arrays are [json]
				if(isArray(obj))
					return '[' + obj.map(stringify).join(',') + ']';
			
					// Objects are {"key":value}
				var buffer = [];
				for(var key in obj) {
					if(!hasProperty(obj, key))
						continue;
					
					buffer.push([key, obj[key]].map(stringify).join(':'));
				}
			
				return '{' + buffer.join(',') + '}';
			},
			parse: function parse(string) {
					// This is what jQuery does, don't blame me!
				return (new Function('return ' + string))();
			}
		};
	}
});
