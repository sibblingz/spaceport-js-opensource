define('e4x/e4x', [
	'util/oop/instanceof',
	'shared/hasProperty',
	'shared/defineProperty',
	'shared/objectKeys',
	'util/as3/makeClassToString',
	'shared/internalError',
	'util/oop/cast',
	'sp/toUint',
	'vendor/sax'
], function(
	__instanceof,
	hasProperty,
	defineProperty,
	objectKeys,
	makeClassToString,
	internalError,
	__cast,
	toUint,
	sax
) {
	// Bad attempt at E4X (ECMA-357),
	// focused on Adobe's implementation and not the spec.
	//
	// This implementation does NOT support mutable XML trees.

	var defineProperties = Object.defineProperties;

	function concatProperty(array, prop) {
		return array.reduce(function(acc, x) {
			if(Array.isArray(x[prop])) {
				return acc.concat(x[prop]);
			} else {
				return acc;
			}
		}, []);
	}

	function defineValue(obj, name, value) {
		defineProperty(obj, name, {
			enumerable: false,
			configurable: false,
			writable: false,
			value: value
		});
	}

	function defineValues(obj, values) {
		objectKeys(values).forEach(function(name) {
			defineValue(obj, name, values[name]);
		});
	}

	function defineMethod(obj, methodName, fn) {
		defineValue(obj.prototype, methodName, function() {
			if(!__instanceof(this, obj)) {
				throw new TypeError();
			}

			if(fn === false) {
				throw new Error("Not implemented: " + methodName);
			} else {
				return fn.apply(this, arguments);
			}
		});
	}

	function defineMethods(obj, fns) {
		objectKeys(fns).forEach(function(methodName) {
			defineMethod(obj, methodName, fns[methodName]);
		});
	}

	// Internal class which represents a node in the XML tree.  DOM-like.
	function XMLNode(type) {
		this.type = type;
	}

	// name, namespace, value
	var XML_NODE_TYPE_ATTRIBUTE = 1;

	// value
	var XML_NODE_TYPE_TEXT = 2;
	var XML_NODE_TYPE_CDATA = 3;
	var XML_NODE_TYPE_COMMENT = 4;
	var XML_NODE_TYPE_PROCESSING = 5;

	// name, children, attributes
	var XML_NODE_TYPE_ELEMENT = 6;

	function isElement(node) {
		return node.type === XML_NODE_TYPE_ELEMENT;
	}

	function isAttribute(node) {
		return node.type === XML_NODE_TYPE_ATTRIBUTE;
	}

	function isNamed(node) {
		return isAttribute(node) || isElement(node);
	}

	function isTextOrAttribute(node) {
		return isAttribute(node) || node.type === XML_NODE_TYPE_TEXT;
	}

	XMLNode.prototype = {
		//type: NaN,

		namespace: null,
		parent: null,

		// These attributes are available on only some node types
		//attributes: [],
		//children: [],
		name: null,
		value: ''
	};

	// 10.3 ToXML
	function ToXML(value) {
		if(value == null) { // Fuzzy
			throw new TypeError();
		}

		if(__instanceof(value, XML)) {
			return value;
		}

		if(__instanceof(value, XMLList)) {
			throw new Error("Not implemented");
		}

		switch(Object.prototype.toString.call(value)) {
		case '[object String]':
		case '[object Number]':
		case '[object Boolean]':
			return new XML(String(value));
		}

		// TODO 10.3.2 ToXML Applied to a W3C XML Information Item Overview

		throw new TypeError();
	}

	var ignoreComments = true;
	var ignoreProcessingInstructions = true;
	var ignoreWhitespace = true;
	var prettyPrinting = true;
	var prettyIndent = 2;

	function escapeString(lut, s) {
		return s.split('').map(function(c) {
			if (hasProperty(lut, c)) {
				return lut[c];
			} else {
				return c;
			}
		}).join('');
	}

	var elementReplacements = {
		"<": "&lt;",
		">": "&gt;",
		"&": "&amp;"
	};

	// 10.2.1.1. EscapeElementValue(s)
	function EscapeElementValue(s) {
		// 1. Let r be the empty string
		// 2. For each character c in s
		// 2.a. If (c == "<"), let r be the result of concatenating r and the string "&lt;"
		// 2.b. Else if (c == ">"), let r be the result of concatenating r and the string "&gt;"
		// 2.c. Else if (c == "&"), let r be the result of concatenating r and the string "&amp;"
		// 2.d. Else, let r be the result of concatenating r and c
		// 3. Return r

		return escapeString(elementReplacements, s);
	}

	var attributeReplacements = {
		"\"": "&quot;",
		"<": "&lt;",
		"&": "&amp;",
		"\u000A": "&#xA;",
		"\u000D": "&#xD;",
		"\u0009": "&#x9;"
	};

	// 10.2.1.2. EscapeAttributeValue(s)
	function EscapeAttributeValue(s) {
		// 1. Let r be the empty string
		// 2. For each character c in s
		// 2.a. If (c is a double quote character (i.e., ")). let r be the result of concatenating r and the string "&quot;"
		// 2.b. Else if (c == "<") let r be the result of concatenating r and the string "&lt;"
		// 2.c. Else if (c == "&") let r be the result of concatenating r and the string "&amp;"
		// 2.d. Else if (c == \u000A) let r be the result of concatenating r and the string "&#xA;"
		// 2.e. Else if (c == \u000D) let r be the result of concatenating r and the string "&#xD;"
		// 2.f. Else if (c == \u0009) let r be the result of concatenating r and the string "&#x9;"
		// 2.g. Else let r be the result of concatenating r and c
		// 3. Return r

		return escapeString(attributeReplacements, s);
	}

	// 9.3  The AttributeName Type
	function AttributeName(qname) {
		this.name = qname;
	}

	// 10.5 ToAttributeName
	function ToAttributeName(x) {
		switch(typeof x) {
			case 'undefined':
				// AS3 deviates from the spec here.
				// If x is undefined, * is used instead.
				return ToAttributeName('*');

			case 'boolean':
			case 'number':
				throw new TypeError(typeof x);

			case 'object':
				if(!x) {
					// null
					throw new TypeError();
				}

				if(__instanceof(x, QName)) {
					return new AttributeName(x);
				} else if(__instanceof(x, AttributeName)) {
					return x;
				//} else if(__instanceof(x, AnyName)) {
					// TODO
					//return ToAttributeName("*");
				} else {
					return ToAttributeName(String(x));
				}

			case 'string':
				// 10.5.1 ToAttributeName Applied to the String Type

				// 1. Let ns be a new Namespace created as if by calling the
				// constructor new Namespace()
				var ns = new Namespace();

				// 2. Let q be a new QName created as if by calling the
				// constructor new QName(ns, s)
				var q = new QName(ns, x);

				// 3. Return a new AttributeName a with a.[[Name]] = q
				return new AttributeName(q);

			default:
				internalError(2404);
		}
	}

	function attrToXMLString(attr, ancestorNamespaces) {
		if(DEBUG) {
			if(attr.type !== XML_NODE_TYPE_ATTRIBUTE) {
				throw new Error("attrToXMLString called on a non-attribute");
			}
		}

		var s = '';

		// TODO 16.b.i.	Let ans be a copy of the result of calling
		// [[GetNamespace]] on a.[[Name]] with argument
		// AncestorNamespaces
		// TODO 16.b.ii.	If (ans.prefix == undefined),
		// TODO 16.b.ii.1.  Let ans.prefix be an arbitrary implementation
		// defined namespace prefix, such that there is no ns2 ?
		// (AncestorNamespaces ? namespaceDeclarations) with ans.prefix
		// == ns2.prefix
		// TODO 16.b.ii.2. If there is no ns2 ? (AncestorNamespaces ?
		// namespaceDeclarations), such that ns2.uri == ans.uri and
		// ns2.prefix == ans.prefix
		// TODO 16.b.ii.2.a. Let namespaceDeclarations =
		// namespaceDeclarations ? { ans }
		// TODO 16.b.iii.	If ans.prefix is not the empty string
		// TODO 16.b.iii.1. Let s be the result of concatenating s,
		// namespace.prefix and the string ":"

		// 16.b.iv.	Let s be the result of concatenating s and
		// a.[[Name]].localName
		s += attr.name.localName;

		// 16.d. Let s be the result of concatenating s, the string "="
		// and a double-quote character (i.e. Unicode codepoint \u0022)
		s += '="';

		// 16.e. If an.[[Class]] == "attribute"
		if(true) {
			// 16.e.i.	Let s be the result of concatenating s and
			// EscapeAttributeValue(an.[[Value]])
			s += EscapeAttributeValue(attr.value);
		} else {
			// 16.f. Else
			// TODO 16.f. i.	Let s be the result of concatenating s
			// and EscapeAttributeValue(an.uri) Let s be the result of
			// concatenating s and a double-quote character (i.e.
			// Unicode codepoint \u0022)
			throw new Error("Not implemented");
		}

		// 16.g. Let s be the result of concatenating s and a
		// double-quote character (i.e. Unicode codepoint \u0022)
		s += '"';

		return s;
	}

	// 10.2 ToXMLString
	function nodeToXMLString(node, ancestorNamespaces, indentLevel) {
		// 1. Let s be the empty string
		var s = '';

		// 2. If IndentLevel was not provided, Let IndentLevel = 0
		indentLevel = indentLevel >>> 0 || 0;

		// 3. If (XML.prettyPrinting == true)
		if(prettyPrinting) {
			// 3.a. For i = 0 to IndentLevel-1, let s be the result of
			// concatenating s and the space <SP> character
			for(var i = 0; i < indentLevel; ++i) {
				s += ' ';
			}
		}

		var name = node.name;
		var value = node.value;

		switch(node.type) {
		// 4. If x.[[Class]] == "text",
		case XML_NODE_TYPE_TEXT:
			// 4.a. If (XML.prettyPrinting == true)
			if(prettyPrinting) {
				// 4.a.i.	Let v be the result of removing all the leading
				// and trailing XMLWhitespace characters from x.[[Value]]
				var v = value.trim();

				// 4.a.ii.	Return the result of concatenating s and
				// EscapeElementValue(v)
				return s + EscapeElementValue(v);
			} else {
				// 4.b. Else
				// 4.b.i.	Return EscapeElementValue(x.[[Value]])
				return EscapeElementValue(value);
			}

			//break; // Implied

		case XML_NODE_TYPE_ATTRIBUTE:
			// 5. If x.[[Class]] == "attribute", return the result of
			// concatenating s and EscapeAttributeValue(x.[[Value]])
			return s + EscapeAttributeValue(value);

		case XML_NODE_TYPE_COMMENT:
			// 6. If x.[[Class]] == "comment", return the result of
			// concatenating s, the string "<!--", x.[[Value]] and the
			// string "-->"
			// XXX Escaping issues???
			return s + '<!--' + value + '-->';

		case XML_NODE_TYPE_CDATA:
			return '<![CDATA[' + value + ']]>';

		case XML_NODE_TYPE_PROCESSING:
			// 7. If x.[[Class]] == "processing-instruction", return the
			// result of concatenating s, the string "<?",
			// x.[[Name]].localName, the space <SP> character, x.[[Value]]
			// and the string "?>"
			return s + '<?' + name.localName + ' ' + value + '?>';

		case XML_NODE_TYPE_ELEMENT:
			// TODO 8.If AncestorNamespaces was not provided, let
			// AncestorNamespaces = { } Let namespaceDeclarations = { }

			// TODO 11. For each name in the set of names consisting of
			// x.[[Name]] and the name of each attribute in
			// x.[[Attributes]]

			// 12. Let s be the result of concatenating s and the string "<"
			s += '<';

			// TODO 13. If namespace.prefix is not the empty string,
			// TODO 13.a. Let s be the result of concatenating s,
			// namespace.prefix and the string ":"

			// TODO 14. Let s be the result of concatenating s and
			// x.[[Name]].localName
			s += name.localName;

			// TODO 15. Let attrAndNamespaces = x.[[Attributes]] ?
			// namespaceDeclarations

			// 16. For each an in attrAndNamespaces
			var attrs = node.attributes;
			if(attrs) {
				attrs.forEach(function(attr) {
					// 16.a. Let s be the result of concatenating s and the
					// space <SP> character
					s += ' ';

					// 16.b. through 16.g.
					s += attrToXMLString(attr, ancestorNamespaces);
				});
			}

			// 17. If x.[[Length]] == 0
			var children = node.children;
			if(!children.length) {
				// 17.a. Let s be the result of concatenating s and "/>"
				s += '/>';

				// 17.b. Return s
				return s;
			}

			// 18. Let s be the result of concatenating s and the string ">"
			s += '>';

			// 19. Let indentChildren = ((x.[[Length]] > 1) or (x.[[Length]] ==
			// 1 and x[0].[[Class]] is not equal to "text"))
			var indentChildren = (children.length > 1) || (children.length === 1 && children[0].type !== XML_NODE_TYPE_TEXT);

			// 20. If (XML.prettyPrinting == true and indentChildren == true)
			// 20.a. Let nextIndentLevel = IndentLevel + XML.PrettyIndent.
			// 21. Else
			// 21.a. Let nextIndentLevel = 0
			var nextIndentLevel = prettyPrinting && indentChildren
				? indentLevel + prettyIndent
				: 0;

			// 22. For i = 0 to x.[[Length]]-1
			children.forEach(function(child) {
				// XXX HACK AS3/Adobe/Tamarin either doesn't parse this into
				// its AST or discards it when pretty-printing.  TODO Figure
				// out which!  **THIS IS NON-STANDARD!**
				if(prettyPrinting && indentChildren
					&& child.type === XML_NODE_TYPE_TEXT
					&& !child.value.trim()) {
					return;
				}

				// 22.a. If (XML.prettyPrinting == true and indentChildren ==
				// true)
				if(prettyPrinting && indentChildren) {
					// 22.a.i.	Let s be the result of concatenating s and a
					// LineTerminator
					s += '\n';
				}

				// TODO 22.b. Let child = ToXMLString (x[i], (AncestorNamespaces ?
				// namespaceDeclarations), nextIndentLevel)
				var childXML = nodeToXMLString(child, null/* TODO */, nextIndentLevel);

				// 22.c Let s be the result of concatenating s and child
				s += childXML;
			});

			// 23. If (XML.prettyPrinting == true and indentChildren == true),
			if(prettyPrinting && indentChildren) {
				// 23.a. Let s be the result of concatenating s and a
				// LineTerminator
				s += '\n';

				// 23.b. For i = 0 to IndentLevel, let s be the result of
				// concatenating s and a space <SP> character
				for(var i = 0; i < indentLevel; ++i) {
					s += ' ';
				}
			}

			// 24. Let s be the result of concatenating s and the string "</"
			s += '</';

			// TODO 25. If namespace.prefix is not the empty string
			// TODO 25.a. Let s be the result of concatenating s,
			// namespace.prefix and the string ":"

			// 26. Let s be the result of concatenating s, x.[[Name]].localName
			// and the string ">"
			s += name.localName + '>';

			// 27. Return s
			return s;
		}
	}

	function parseXML(xmlString) {
		// TODO Respect 13.4.3 Properties of the XML constructor

		var elementStack = [];
		var roots = [];

		function addChild(node) {
			if(elementStack.length) {
				var parent = elementStack[elementStack.length - 1];
				node.parent = parent;
				parent.children.push(node);
			} else {
				elementStack.push(node);
				roots.push(node);
			}
		}

		var parser = sax.parser(true /* strict */);
		parser.ontext = function ontext(text) {
			if(elementStack.length) {
				var n = new XMLNode(XML_NODE_TYPE_TEXT);
				n.value = text;
				addChild(n);
			} else {
				// Do nothing; we don't add text to the document itself.
			}
		};

		parser.oncomment = function oncomment(text) {
			if(ignoreComments) {
				return;
			}

			if(elementStack.length) {
				var n = new XMLNode(XML_NODE_TYPE_COMMENT);
				n.value = text;
				addChild(n);
			} else {
				// Do nothing; we don't add comments to the document itself.
			}
		};

		parser.onopentag = function onopentag(node) {
			var n = new XMLNode(XML_NODE_TYPE_ELEMENT);
			n.children = [];
			n.name = new QName(node.name);

			var attrs = node.attributes;
			n.attributes = objectKeys(attrs).map(function(attrName) {
				var attrN = new XMLNode(XML_NODE_TYPE_ATTRIBUTE);
				attrN.name = new QName(attrName);
				attrN.value = attrs[attrName];
				return attrN;
			});

			// Ordering is important
			addChild(n);
			elementStack.push(n);
		};

		parser.onclosetag = function onclosetag() {
			elementStack.pop();
		};

		parser.oncdata = function oncdata(text) {
			var n = new XMLNode(XML_NODE_TYPE_CDATA);
			n.value = text;
			addChild(n);
		};

		//parser.onprocessinginstruction =
		//parser.onsgmldeclaration =
		//parser.ondoctype =
		//parser.onattribute = ???
		//parser.onerror =

		try {
			parser.write(xmlString).close();
		} catch(e) {
			throw new TypeError("Error parsing XML:\n" + e.toString());
		}

		return roots;
	}

	// 10.3.1 ToXML Applied to the String Type
	function parseXMLInto(xmlObject /*:XML */, xmlString) {
		var roots = parseXML(xmlString);
		if(roots.length > 1) {
			throw new Error(); // FIXME
		}

		var root = roots[0] || new XMLNode(XML_NODE_TYPE_TEXT);
		XML.call(xmlObject, root);
		return xmlObject;
	}

	// 10.4.1 ToXMLList Applied to the String Type
	function parseXMLListInto(xmlObject /*:XMLList */, xmlString) {
		try {
			var roots = parseXML("<x>" + xmlString + "</x>");
			XMLList.call(xmlObject, roots[0].children);
		} catch(e) {
			var textNode = new XMLNode(XML_NODE_TYPE_TEXT);
			textNode.value = xmlString;
			XMLList.call(xmlObject, [textNode]);
		}
		return xmlObject;
	}

	function const_(x) {
		return function() {
			return x;
		};
	}

	function nodeGetter(fn) {
		return function() {
			var n = fn.apply(this, arguments);
			return new XML(n);
		};
	}

	function nodeListGetter(fn) {
		return function() {
			var n = fn.apply(this, arguments);
			return new XMLList(n);
		};
	}

	function nub(xs) {
		var acc = [];
		xs.forEach(function(x) {
			if(acc.indexOf(x) < 0) {
				acc.push(x);
			}
		});
		return acc;
	}

	function getNodeNames(nodes) {
		return nub(nodes.filter(isNamed).map(function(node) {
			return node.name.localName;
		}));
	}

	// 9.1.1.1 [[Get]] (P)
	// Since JavaScript doesn't support overriding generic [[Get]] without
	// proxies, we emulate it by defining a bunch of properties manually using
	// Object.defineProperty.
	function accessorizer(transformName) {
		return function accessorize(xmlObject, nodes) {
			nodes = nodes.filter(isNamed);
			var names = getNodeNames(nodes);

			if(names.indexOf(null) >= 0) {
				throw new Error("fuck");
			}
			if(names.indexOf(undefined) >= 0) {
				throw new Error("fuck");
			}

			names.forEach(function(name) {
				var propName = transformName(name);
				if(!Object.prototype.hasOwnProperty.call(xmlObject, propName)) {
					defineProperty(xmlObject, propName, {
						enumerable: false,
						configurable: false,
						get: nodeListGetter(function() {
							return nodes.filter(function(node) {
								return node.name.localName === name;
							});
						})
					});
				}
			});
		};
	}

	var addAttributeAccessors = accessorizer(function(name) {
		return '@' + name;
	});

	var addChildAccessors = accessorizer(function(name) {
		return name;
	});

	// 12.2 The for-in Statement
	// 12.3 The for-each-in Statement
	function addEnumerationAccessor(xmlObject, node, index) {
		// This implementation exploits the fact that modern JavaScript engines
		// iterate based on insertion order.  We thus insert the children as
		// enumerable properties in document order (using integer indices) to
		// support for-in iteration.
		defineProperty(xmlObject, index, {
			enumerable: true,
			configurable: false,
			get: nodeGetter(const_(node))
		});

		// for-each-in is not supported in JavaScript, so that part of the spec
		// cannot be implemented.
	}

	function addEnumerationAccessors(xmlObject, elements) {
		elements.forEach(function(node, index) {
			addEnumerationAccessor(xmlObject, node, index);
		});
	}

	// TODO 9.1.1.7 [[DeepCopy]] ( )
	function DeepCopy(xml) {
		throw new Error("Not implemented");
	}

	var NODE = '_node'; // Private node name

	// 13.4 XML Objects
	function XML(value) {
		// 13.4.1 The XML Constructor Called as a Function
		if(!__instanceof(this, XML)) {
			return ToXML(value);
		}

		if(typeof value === 'string') {
			parseXMLInto(this, value);
		} else if(__instanceof(value, XMLNode)) {
			// Custom constructor; creates an XML object from an XMLNode

			defineValue(this, NODE, value);

			// 9.1.1.1 [[Get]] (P)
			var attrs = value.attributes;
			if(attrs) {
				addAttributeAccessors(this, attrs);
			}

			var children = value.children;
			if(children) {
				addChildAccessors(this, children);
			}

			addEnumerationAccessors(this, [value]);

			// TODO 9.1.1.2 [[Put]] (P, V)
			// TODO 9.1.1.3 [[Delete]] (P)
			// TODO 9.1.1.4 [[DeleteByIndex]] (P)
			// TODO 9.1.1.5 [[DefaultValue]] (hint)
			// TODO 9.1.1.6 [[HasProperty]] (P)
			// TODO 9.1.1.8 [[Descendants]] (P)
			// TODO 9.1.1.9 [[Equals]] (V)
			// TODO 9.1.1.10 [[ResolveValue]] ( )
			// TODO 9.1.1.11 [[Insert]] (P, V)
			// TODO 9.1.1.12 [[Replace]] (P, V)
			// TODO 9.1.1.13 [[AddInScopeNamespace]] ( N )
		} else {
			// 13.4.2 The XML Constructor
			var x = ToXML(value);
			if(__instanceof(value, XML) || __instanceof(value, XMLList)) {
				return DeepCopy(x);
			} else {
				return x;
			}
		}
	}

	defineValue(XML, 'toString', makeClassToString('XML'));

	// 13.4.4 Properties of the XML Prototype Object (Built-in Methods)

	// 13.4.4.1 XML.prototype.constructor
	defineValue(XML.prototype, 'constructor', XML);

	// 9.2.1.6 [[Append]] (V)
	function XMLList_Append(xmllist, v) {
		// FIXME My copy of the spec is incomplete (3.f. has no body!)
		// 1. Let i = x.[[Length]]
		// 2. Let n = 1
		// 3. If Type(V) is XMLList,
		// 3.a. Let x.[[TargetObject]] = V.[[TargetObject]]
		// 3.b. Let x.[[TargetProperty]] = V.[[TargetProperty]]
		// 3.c. Let n = V.[[Length]]
		// 3.d. If n == 0, Return
		// 3.e. For j = 0 to V.[[Length]]-1, let x[i + j] = V[j]
		// 3.f.
		// 4. Let x.[[Length]] = x.[[Length]] + n
		// 5. Return
		var nodes = xmllist[NODES];

		if(__instanceof(v, XMLList)) {
			v[NODES].forEach(XMLList_AppendNode.bind(null, xmllist));
		} else if(__instanceof(v, XML)) {
			XMLList_AppendNode(xmllist, v[NODE]);
		} else {
			throw new TypeError();
		}
	}

	function XMLList_AppendNode(xmllist, node) {
		// GOTCHA: We must add accessors here...
		var children = node.children;
		children && addChildAccessors(xmllist, children);

		var listNodes = xmllist[NODES];
		addEnumerationAccessor(xmllist, node, listNodes.length);

		listNodes.push(node);
	}

	function ToXMLName(x) {
		switch(typeof x) {
			case 'undefined':
			case 'boolean':
			case 'number':
				throw new TypeError();

			case 'object':
				if(!x) {
					// null
					throw new TypeError();
				}

				if(__instanceof(x, AttributeName)) {
					return x;
				//} else if(__instanceof(x, AnyName)) {
					// TODO
					//return ToAttributeName("*");
				} else {
					return ToAttributeName(String(x));
				}

			case 'string':
				// 1. If ToString(ToUint32(s)) == ToString(s), throw a TypeError exception
				if(String(toUint(x)) === String(x)) {
					throw new TypeError();
				}

				// 2. If the first character of s is "@"
				if(/^@/.test(x)) {
					// 2.a. Let name = s.substring(1, s.length)
					// 2.b. Return ToAttributeName(name)
					return ToAttributeName(x.substr(1));
				} else {
					// 3. Else

					// 3.a. Return a QName object created as if by calling the constructor new QName(s)
					return new QName(x);
				}

			default:
				internalError(2405);
		}
	}

	function attributeNameMatches(pattern, x) {
		// Factored from: 9.1.1.1, 9.1.1.8

		var patternN = pattern.name;
		var xN = x.name;

		// 4.a.i. If ((n.[[Name]].localName == "*") or (n.[[Name]].localName == a.[[Name]].localName))
		var localNameMatch = patternN.localName === '*' || patternN.localName === xN.localName;
		// and ((n.[[Name]].uri == null) or (n.[[Name]].uri == a.[[Name]].uri))
		var uriMatch = patternN.uri === null || patternN.uri === xN.uri;

		return localNameMatch && uriMatch;
	}

	function nodeNameMatches(patternN, x) {
		// Factored from: 9.1.1.1, 9.1.1.8

		var xN = x.name;

		// 4.a. If ((n.localName == "*")
		//      or ((x[k].[[Class]] == "element") and
		//         (x[k].[[Name]].localName == n.localName)))
		var localNameMatch = patternN.localName === '*'
			|| (isElement(x) && patternN.localName === xN.localName);

		// and ((n.uri == null) or ((x[k].[[Class]] == "element") and (n.uri  == x[k].[[Name]].uri)))
		var uriMatch = patternN.uri === null
			|| (isElement(x) && patternN.uri === xN.uri);

		return localNameMatch && uriMatch;
	}

	function forEachMatchingAttribute(node, pattern, fn) {
		var attrs = node.attributes;
		attrs && attrs.forEach(function(attr) {
			if(attributeNameMatches(pattern, attr)) {
				fn(attr);
			}
		});
	}

	function forEachChild(node, fn) {
		var children = node.children;
		children && children.forEach(fn);
	}

	// 9.1.1.1 [[Get]] (P)
	function XML_Get(xml, prop) {
		// TODO
		// 1. If ToString(ToUint32(P)) == P
		// 1.a. Let list = ToXMLList(x)
		// 1.b.  Return the result of calling the [[Get]] method of list with argument P

		// 2. Let n = ToXMLName(P)
		var name = ToXMLName(prop);

		// 3. Let list be a new XMLList with list.[[TargetObject]] = x and list.[[TargetProperty]] = n
		var list = new XMLList();
		// TODO TargetObject, TargetProperty

		// 4. If Type(n) is AttributeName
		if(__instanceof(name, AttributeName)) {
			// 4.a. For each a in x.[[Attributes]]
			forEachMatchingAttribute(xml[NODE], name, function(attr) {
				// 4.a.i.1. Call the [[Append]] method of list with argument a
				XMLList_Append(list, new XML(attr));
			});

			// 4.b. Return list
			return list;
		}

		// 5. For (k = 0 to x.[[Length]]-1)
		forEachChild(xml[NODE], function(childNode) {
			if(nodeNameMatches(name, childNode)) {
				// 4.a.i.  Call the [[Append]] method of list with argument x[k]
				XMLList_Append(list, new XML(childNode));
			}

			// 5.a.i.  Call the [[Append]] method of list with argument x[k]
			XMLList_Append(list, new XML(childNode));
		});

		// 6. Return list
		return list;
	}

	// 9.1.1.8  [[Descendants]]  (P)
	function XML_Descendants(xml, p) {
		// 1. Let n = ToXMLName(P)
		var name = ToXMLName(p);

		// 2. Let list be a new XMLList with list.[[TargetObject]] = null
		var list = new XMLList();
		// TODO TargetObject

		// 3. If Type(n) is AttributeName
		if(__instanceof(name, AttributeName)) {
			forEachMatchingAttribute(xml[NODE], name, function(attr) {
				// 3.a.i.1. Call the [[Append]] method of list with argument a
				XMLList_Append(list, new XML(attr));
			});

			return list;
		}

		// 4. For (k = 0 to x.[[Length]]-1)
		forEachChild(xml[NODE], function(childNode) {
			if(nodeNameMatches(name, childNode)) {
				// 4.a.i.  Call the [[Append]] method of list with argument x[k]
				XMLList_Append(list, new XML(childNode));
			}

			// 4.b. Let dq be the results of calling the [[Descendants]] method of x[k] with argument P
			var dq = XML_Descendants(new XML(childNode), p);

			// 4.c. If dq.[[Length]] > 0, call the [[Append]] method of list with argument dq
			if(dq.length() > 0) {
				XMLList_Append(list, dq);
			}
		});

		// 5. Return list
		return list;
	}

	// 9.2.1.9 [[Equals]] (V)
	function XML_Equals(xml, v) {
		// 1. If Type(V) is not XML, return false
		if(!__instanceof(v, XML)) {
			return false;
		}

		var xmlNode = xml[NODE];
		var vNode = v[NODE];

		// 2. If x.[[Class]] is not equal to V.[[Class]], return false
		if(xmlNode.type !== vNode.type) {
			return false;
		}

		// 3. If x.[[Name]] is not null
		if(xmlNode.name !== null) {
			// 3.a. If V.[[Name]] is null, return false
			if(!vNode.name === null) {
				return false;
			}

			// 3.b. If x.[[Name]].localName is not equal to V.[[Name]].localName, return false
			if(xmlNode.name.localName !== vNode.name.localName) {
				return false;
			}

			// 3.c. If x.[[Name]].uri is not equal to V.[[Name]].uri, return false
			if(xmlNode.name.uri !== vNode.name.uri) {
				return false;
			}
		} else if(vNode.name !== null) {
			// 4. Else if V.[[Name]] is not null, return false
			return false;
		}

		// 5. If x.[[Attributes]] does not contain the same number of items as V.[[Attributes]], return false
		if(xmlNode.attributes.length !== vNode.attributes.length) {
			return false;
		}

		// 6. If x.[[Length]] is not equal to V.[[Length]], return false
		if(xml.length() !== v.length()) {
			return false;
		}

		// 7. If x.[[Value]] is not equal to V.[[Value]], return false
		if(xmlNode.value !== vNode.value) {
			return false;
		}

		// 8. For each a in x.[[Attributes]]
		var attrsEq = xmlNode.attributes.every(function(a) {
			return v.some(function(b) {
				// 8.a. If V.[[Attributes]] does not contain an attribute b,
				//      such that
				//      b.[[Name]].localName == a.[[Name]].localName,
				//      b.[[Name]].uri == a.[[Name]].uri
				//      and b.[[Value]] == a.[[Value]],
				//      return false
				return eq_QName_QName(a.name, b.name) && a.value === b.value;
			});
		});

		// 9. For i = 0 to x.[[Length]]-1
		if(xmlNode.children) {
			return xmlNode.children.every(function(xmlChild, i) {
				// 9.a. Let r be the result of calling the [[Equals]] method of x[i] with argument V[i]
				// 9.b. If r == false, return false
				var vChild = vNode.children[i];
				return XML_Equals(xmlChild, vChild);
			});
		} else {
			// 10. Return true
			return true;
		}
	}

	defineMethods(XML, {
		// TODO 13.4.4.2 XML.prototype.addNamespace ( namespace )
		// TODO 13.4.4.3 XML.prototype.appendChild ( child )

		// 13.4.4.4 XML.prototype.attribute ( attributeName )
		'attribute': function attribute(attributeName) {
			// 1. Let name = ToAttributeName(attributeName)
			var name = ToAttributeName(attributeName);

			// 2. Return the result of calling the [[Get]] method of x with
			//    argument name
			return XML_Get(this, name);
		},

		// 13.4.4.5 XML.prototype.attributes ( )
		'attributes': function attributes() {
			// 1. Return the result of calling the [[Get]] method of x with
			// argument ToAttributeName("*")
			return XML_Get(this, ToAttributeName('*'));
		},

		// TODO 13.4.4.6 XML.prototype.child ( propertyName )
		// TODO 13.4.4.7 XML.prototype.childIndex ( )

		// 13.4.4.8 XML.prototype.children ( )
		'children': function children() {
			// FIXME null?
			var n = this[NODE];
			return n.children ? new XMLList(n.children) : null;
		},

		// TODO 13.4.4.9 XML.prototype.comments ( )
		// TODO 13.4.4.10	XML.prototype.contains ( value )
		// TODO 13.4.4.11	XML.prototype.copy ( )
		// 13.4.4.12 XML.prototype.descendants ( [ name ] )
		'descendants': function descendants(name) {
			// 1. If name is not specified, let name = "*"
			if(!arguments.length) {
				name = '*';
			}

			// 2. Return the result of calling the [[Descendants]] method of x
			//    with argument name
			return XML_Descendants(this, name);
		},

		// TODO 13.4.4.13	XML.prototype.elements ( [ name ] )
		// TODO 13.4.4.14	XML.prototype.hasOwnProperty ( P )
		// TODO 13.4.4.15	XML.prototype.hasComplexContent( )

		// 13.4.4.16	XML.prototype.hasSimpleContent( )
		'hasSimpleContent': function hasSimpleContent() {
			var n = this[NODE];
			if(n.type === XML_NODE_TYPE_COMMENT || n.type == XML_NODE_TYPE_PROCESSING) {
				return false;
			}

			return n.children ? !n.children.some(isElement) : true;
		},

		// TODO 13.4.4.17	XML.prototype.inScopeNamespaces( )
		// TODO 13.4.4.18	XML.prototype.insertChildAfter ( child1 , child2)
		// TODO 13.4.4.19	XML.prototype.insertChildBefore ( child1 , child2 )

		// 13.4.4.20	XML.prototype.length ( )
		'length': function length() {
			return 1;
		},

		// 13.4.4.21	XML.prototype.localName ( )
		'localName': function localName() {
			return this.name().localName;
		},

		// 13.4.4.22	XML.prototype.name ( )
		'name': function name() {
			return this[NODE].name;
		},

		// TODO 13.4.4.23	XML.prototype.namespace ( [ prefix ] )
		// TODO 13.4.4.24	XML.prototype.namespaceDeclarations ( )
		// TODO 13.4.4.25	XML.prototype.nodeKind ( )
		// TODO 13.4.4.26	XML.prototype.normalize ( )
		// TODO 13.4.4.27	XML.prototype.parent ( )
		// TODO 13.4.4.28	XML.prototype.processingInstructions ( [ name ] )
		// TODO 13.4.4.29	XML.prototype.prependChild ( value )
		// TODO 13.4.4.30	XML.prototype.propertyIsEnumerable ( P )
		// TODO 13.4.4.31	XML.prototype.removeNamespace ( namespace )
		// TODO 13.4.4.32	XML.prototype.replace ( propertyName , value )
		// TODO 13.4.4.33	XML.prototype.setChildren ( value )
		// TODO 13.4.4.34	XML.prototype.setLocalName ( name )
		// TODO 13.4.4.35	XML.prototype.setName( name )
		// TODO 13.4.4.36	XML.prototype.setNamespace ( ns )
		// TODO 13.4.4.37	XML.prototype.text ( )

		// 13.4.4.38	XML.prototype.toString ( )
		'toString': function toString() {
			// 10.1.1 ToString Applied to the XML Type
			var n = this[NODE];
			if(n.type !== XML_NODE_TYPE_ELEMENT) {
				return n.value || '';
			}

			var children = n.children;
			if(!children) {
				return '';
			}

			if(children.some(function(child) {
				return child.type === XML_NODE_TYPE_ELEMENT;
			})) {
				return this.toXMLString();
			}

			return children.map(function(child) {
				return new XML(child).toString();
			}).join('');
		},

		// 13.4.4.39	XML.prototype.toXMLString ( )
		'toXMLString': function toXMLString(ancestorNamespaces, indentLevel) {
			return nodeToXMLString(this[NODE], ancestorNamespaces, indentLevel);
		}

		// TODO 13.4.4.40	XML.prototype.valueOf ( )
	});

	// 13.4.3 Properties of the XML constructor
	defineProperties(XML, {
		// 13.4.3.1 XML.prototype
		// Implied

		// 13.4.3.2 XML.ignoreComments
		'ignoreComments': {
			enumerable: false,
			configurable: false,
			get: function() { return ignoreComments; },
			set: function(x) { ignoreComments = Boolean(x); }
		},

		// 13.4.3.3 XML.ignoreProcessingInstructions
		'ignoreProcessingInstructions': {
			enumerable: false,
			configurable: false,
			get: function() { return ignoreProcessingInstructions; },
			set: function(x) { ignoreProcessingInstructions = Boolean(x); }
		},

		// 13.4.3.4 XML.ignoreWhitespace
		'ignoreWhitespace': {
			enumerable: false,
			configurable: false,
			get: function() { return ignoreWhitespace; },
			set: function(x) { ignoreWhitespace = Boolean(x); }
		},

		// 13.4.3.5 XML.prettyPrinting
		'prettyPrinting': {
			enumerable: false,
			configurable: false,
			get: function() { return prettyPrinting; },
			set: function(x) { prettyPrinting = Boolean(x); }
		},

		// 13.4.3.6 XML.prettyIndent
		'prettyIndent': {
			enumerable: false,
			configurable: false,
			get: function() { return prettyIndent; },
			set: function(x) { prettyIndent = (x >>> 0) || 0; }
		},

		// TODO 13.4.3.7 XML.settings ( )

		// 13.4.3.8 XML.setSettings ( [ Settings ] )
		'setSettings': {
			enumerable: false,
			configurable: false,
			value: function setSettings(settings) {
				if(settings == null) {  // Fuzzy
					ignoreComments = true;
					ignoreProcessingInstructions = true;
					ignoreWhitespace = true;
					prettyPrinting = true;
					prettyIndent = 2;
				} else if(typeof settings === 'object') {
					if(typeof settings.ignoreComments === 'boolean')
						ignoreComments = settings.ignoreComments;
					if(typeof settings.ignoreProcessingInstructions === 'boolean')
						ignoreProcessingInstructions = settings.ignoreProcessingInstructions;
					if(typeof settings.ignoreWhitespace === 'boolean')
						ignoreWhitespace = settings.ignoreWhitespace;
					if(typeof settings.prettyPrinting === 'boolean')
						prettyPrinting = settings.prettyPrinting;
					if(typeof settings.prettyIndent === 'number')
						prettyIndent = settings.prettyIndent >>> 0;
				}
			}
		}

		// TODO 13.4.3.9 XML.defaultSettings ( )
		// TODO 13.4.3.10	[[HasInstance]] ( V )
	});

	var NODES = '_nodes'; // Private nodes name

	// 9.2.1.1 [[Get]] (P)
	function XMLList_Get(xmlList, p) {
		// TODO
		// 1. If ToString(ToUint32(P)) == P
		// a.  Return the result of calling the Object [[Get]] method with x as the this object and argument P

		// 2. Let list be a new XMLList with list.[[TargetObject]] = x and list.[[TargetProperty]] = P
		var list = new XMLList();
		// TODO TargetObject, TargetProperty

		// 3. For i = 0 to x.[[Length]]-1,
		xmlList[NODES].forEach(function(node) {
			// a. If x[i].[[Class]] == "element",
			if(isElement(node)) {
				// i. Let gq be the result of calling the [[Get]] method of x[i] with argument P
				var gq = XML_Get(new XML(node), p);

				// ii. If gq.[[Length]] > 0, call the [[Append]] method of list with argument gq
				if(gq.length() > 0) {
					XMLList_Append(list, gq);
				}
			}
		});

		// 4. Return list
		return list;
	}

	// 9.2.1.8 [[Descendants]]  (P)
	function XMLList_Descendants(xmlList, p) {
		// 1. Let list be a new XMLList with list.[[TargetObject]] = null
		var list = new XMLList();
		// TODO TargetObject

		// 2. For q = 0 to x.[[Length]] - 1
		xmlList[NODES].forEach(function(node) {
			// 2.a. If (x[q].[[Class]] == "element")
			if(isElement(node)) {
				// 2.a.i. Let dq be the result of calling the [[Descendants]]
				//        method of x[q] with argument P
				var dq = XML_Descendants(new XML(node), p);

				// 2.a.ii. If dq.[[Length]] > 0, call the [[Append]] method of
				//         list with argument dq
				if(dq.length() > 0) {
					XMLList_Append(list, dq);
				}
			}
		});

		// 3. Return list
		return list;
	}

	// 9.2.1.9 [[Equals]] (V)
	function XMLList_Equals(xmlList, v) {
		// 1. If V == undefined and x.[[Length]] == 0, return true
		if(typeof v === 'undefined' && xmlList.length() === 0) {
			return true;
		}

		// 2. If Type(V) is XMLList
		if(__instanceof(v, XMLList)) {
			// 2.a. If x.[[Length]] is not equal to V.[[Length]], return false
			if(xmlList.length() !== v.length()) {
				return false;
			}

			// 2.b. For i = 0 to x.[[Length]]
			for(var i = 0; i < xmlList.length(); ++i) {
				// 2.b.i. If the result of the comparison x[i] == V[i] is false, return false
				if(!XML_Equals(xmlList[i], v[i])) {
					return false;
				}
			}

			// 2.c. Return true
			return true;
		} else if(xmlList.length() === 1) {
			// 3. Else if x.[[Length]] == 1

			// 3.a. Return the result of the comparison x[0] == V
			return eq_XML_any(xmlList[0], v);
		} else {
			// 4. Return false
			return false;
		}
	}

	// 10.4 ToXMLList
	function ToXMLList(value) {
		if(value == null) { // Fuzzy
			return ToXMLList('');
		}

		if(__instanceof(value, XML)) {
			return new XMLList([value[NODE]]);
		}

		if(__instanceof(value, XMLList)) {
			return value;
		}

		switch(Object.prototype.toString.call(value)) {
		case '[object String]':
		case '[object Number]':
		case '[object Boolean]':
			return new XMLList(String(value));
		}

		throw new TypeError();
	}

	// 13.5 XMLList Objects
	function XMLList(value) {
		// 13.5.1 The XML Constructor Called as a Function
		if(!__instanceof(this, XMLList)) {
			return ToXMLList(value);
		}

		if(typeof value === 'string') {
			parseXMLListInto(this, value);
		} else if(Array.isArray(value)) {
			// Custom constructor; creates an XMLList object from an array of
			// XMLNode objects
			defineValue(this, NODES, value);

			addAttributeAccessors(this, concatProperty(value, 'attributes'));
			addChildAccessors(this, concatProperty(value, 'children'));
			addEnumerationAccessors(this, value);
		} else {
			// 13.5.2 The XMLList Constructor
			if(__instanceof(value, XMLList)) {
				throw new Error("Not implemented");
			}

			return ToXMLList(value);
		}
	}

	defineValue(XMLList, 'toString', makeClassToString('XMLList'));

	// 13.5.4 Properties of the XMLList Prototype Object (Built-in Methods)

	// 13.5.4.1 XMLList.prototype.constructor
	defineValue(XMLList.prototype, 'constructor', XMLList);

	defineMethods(XMLList, {
		// 13.5.4.2 XMLList.prototype.attribute ( attributeName )
		'attribute': function attribute(attributeName) {
			// 1. Let name = ToAttributeName(attributeName)
			var name = ToAttributeName(attributeName);

			// 2. Return the result of calling the [[Get]] method of list with
			//    argument name
			return XMLList_Get(this, name);
		},

		// 13.5.4.3 XMLList.prototype.attributes ( )
		'attributes': function attributes() {
			// 1. Return the result of calling the [[Get]] method of list with
			//    argument ToAttributeName("*")
			return XMLList_Get(this, ToAttributeName('*'));
		},

		// TODO 13.5.4.4 XMLList.prototype.child ( propertyName )

		// 13.5.4.5 XMLList.prototype.children ( )
		'children': function children() {
			return new XMLList(concatProperty(this[NODES], 'children'));
		},

		// TODO 13.5.4.6 XMLList.prototype.comments ( )
		// TODO 13.5.4.8 XMLList.prototype.contains ( value )
		// TODO 13.5.4.9 XMLList.prototype.copy ( )

		// 13.5.4.10 XMLList.prototype.descendants ( [ name ] )
		'descendants': function descendants(name) {
			// 1. If name is not specified, let name = "*"
			if(!arguments.length) {
				name = '*';
			}

			// 2. Return the result of calling the [[Descendants]] method of x
			//    with argument name
			return XMLList_Descendants(this, name);
		},

		// TODO 13.5.4.11	XMLList.prototype.elements ( [ name ] )
		// TODO 13.5.4.12	XMLList.prototype.hasOwnProperty ( P )
		// TODO 13.5.4.13	XMLList.prototype.hasComplexContent( )

		// 13.5.4.14	XMLList.prototype.hasSimpleContent( )
		'hasSimpleContent': function hasSimpleContent() {
			switch(this.length()) {
				case 0:
					return true;
				case 1:
					return new XML(this[NODES][0]).hasSimpleContent();
				default:
					return !this[NODES].some(isElement);
			}
		},

		// 13.5.4.15	XMLList.prototype.length ( )
		'length': function length() {
			return this[NODES].length;
		},

		// TODO 13.5.4.16	XMLList.prototype.normalize ( )
		// TODO 13.5.4.17	XMLList.prototype.parent ( )
		// TODO 13.5.4.18	XMLList.prototype.processingInstructions ( [ name ] )
		// TODO 13.5.4.19	XMLList.prototype.propertyIsEnumerable ( P )
		// TODO 13.5.4.20	XMLList.prototype.text ( )

		// 13.5.4.21	XMLList.prototype.toString ( )
		'toString': function toString() {
			if(this.hasSimpleContent()) {
				return this[NODES].map(function(node) {
					switch(node.type) {
						case XML_NODE_TYPE_COMMENT:
						case XML_NODE_TYPE_PROCESSING:
							return '';
						default:
							return nodeToXMLString(node);
					}
				}).join('');
			} else {
				return this.toXMLString();
			}
		},

		// 13.5.4.22	XMLList.prototype.toXMLString ( )
		'toXMLString': function toXMLString(ancestorNamespaces, indentLevel) {
			var sep = '\n';  // Always
			return this[NODES].map(function(node) {
				// For whatever reason, indentLevel is unused per the spec
				return nodeToXMLString(node, ancestorNamespaces);
			}).join(sep);
		}

		// TODO 13.5.4.23	XMLList.prototype.valueOf ( )
	});

	// 13.2 Namespace Objects
	function Namespace(value, arg1) {
		// 13.2.1 The Namespace Constructor Called as a Function
		if(!__instanceof(this, Namespace)) {
			if(__instanceof(value, Namespace) && arguments.length === 1) {
				return value;
			}

			return new Namespace(value, arg1);
		}

		// 13.2.2  The Namespace Constructor

		var prefix, uri;

		// 1. Create a new Namespace object n
		// 2. If prefixValue is not specified and uriValue is not specified
		if(!arguments.length) {
			// 2.a. Let n.prefix be the empty string
			prefix = '';
			// 2.b. Let n.uri be the empty string
			uri = '';
		} else if(arguments.length === 1) {
			// 3. Else if prefixValue is not specified

			// 3.a. If Type(uriValue) is Object
			//      and uriValue.[[Class]] == "Namespace"
			if(__instanceof(value, Namespace)) {
				// 3.a.i. Let n.prefix = uriValue.prefix
				prefix = value.prefix;
				// 3.a.ii. Let n.uri = uriValue.uri
				uri = value.uri;
			} else if(__instanceof(value, QName) && value.uri !== null) {
				// 3.b. Else if Type(uriValue) is Object
				//      and uriValue.[[Class]] == "QName"
				//      and uriValue.uri is not null

				// 3.b.i.  Let n.uri = uriValue.uri
				uri = value.uri;

				// NOTE implementations that preserve prefixes in qualified
				// names may also set n.prefix = uriValue.[[Prefix]]
			} else {
				// 3.c. Else

				// 3.c.i. Let n.uri = ToString(uriValue)
				uri = String(value);

				// 3.c.ii. If (n.uri is the empty string), let n.prefix be the empty string
				if(!uri) {
					prefix = '';
				}

				// 3.c.iii. Else n.prefix = undefined
				//prefix = undefined;  // Implied.
			}
		} else {
			// 4. Else

			// 4.a. If Type(uriValue) is Object and uriValue.[[Class]] == "QName" and uriValue.uri is not null
			if(__instanceof(value, QName) && value.uri !== null) {
				// 4.a.i. Let n.uri = uriValue.uri
				uri = value.uri;
			} else {
				// 4.b. Else

				// 4.b.i. Let n.uri = ToString(uriValue)
				uri = String(value);
			}

			// 4.c. If n.uri is the empty string
			if(!uri) {
				// 4.c.i. If prefixValue is undefined or ToString(prefixValue) is the empty string
				if(typeof arg1 === 'undefined' || !String(arg1)) {
					// 4.c.i.1. Let n.prefix be the empty string
					prefix = '';
				} else {
					// ii. Else throw a TypeError exception
					throw new TypeError();
				}
			} else if(typeof arg1 === 'undefined') {
				// 4.d. Else if prefixValue is undefined, let n.prefix = undefined
				//prefix = undefined;  // Implied.
			} else if(!isXMLName(arg1)) {
				// 4.e. Else if isXMLName(prefixValue) == false

				// 4.e.i. Let n.prefix = undefined
				//prefix = undefined;  // Implied.
			} else {
				// 4.f. Else let n.prefix = ToString(prefixValue)
				prefix = String(arg1);
			}
		}

		// 13.2.5.1 prefix
		defineValue(this, 'prefix', prefix);

		// 13.2.5.2 uri
		defineValue(this, 'uri', uri);

		// 5. Return n
		//return this;  // Implied.
	}

	// 13.2.4.1 Namespace.prototype.constructor
	defineValue(Namespace.prototype, 'constructor', Namespace);

	// 13.2.3.1 Namespace.prototype
	defineMethods(Namespace, {
		// 13.2.4.2 Namespace.prototype.toString()
		'toString': function toString() {
			// 1. if Type(n) is not Object or n.[[Class]] is not equal to "Namespace", throw a TypeError exception
			__cast(this, Namespace);

			// 2. Return n.uri
			return this.uri;
		}
	});

	// 13.1.1.1 [[DefaultNamespace]]
	var DefaultNamespace = new Namespace();

	// 12.1.1 GetDefaultNamespace ( )
	function GetDefaultNamespace() {
		// TODO
		return DefaultNamespace;
	}

	function cloneQName(qname) {
		return new QName(qname.uri, qname.localName);
	}

	// 13.3 QName Objects
	function QName(value, arg1) {
		// 13.3.1  The QName Constructor Called as a Function
		if(!__instanceof(this, QName)) {
			if(arguments.length === 1) {
				return __cast(value, QName);
			}

			return new QName(value, arg1);
		}

		// 13.3.2 The QName Constructor

		var namespace, name;

		switch(arguments.length) {
			case 1:
				name = value;
				break;
			case 2:
				namespace = value;
				name = arg1;
				break;
		}

		// 1. If (Type(Name) is Object and Name.[[Class]] == "QName")
		if(__instanceof(value, QName)) {
			if(arguments.length === 1) {
				// 1.a. If (Namespace is not specified), return a copy of Name
				return cloneQName(value);
			} else {
				// 1.b. Else let Name = Name.localName
				name = value.localName;
			}
		}

		// 2. If (Name is undefined or not specified)
		if(typeof name === 'undefined' || !arguments.length) {
			// 2.a. Let Name = “”
			name = '';
		} else {
			// 3. Else let Name = ToString(Name)
			name = String(name);
		}

		// 4. If (Namespace is undefined or not specified)
		if(typeof namespace === 'undefined' || arguments.length < 2) {
			// 4.a. If Name = "*"
			if(name === '*') {
				// 4.a.i. Let Namespace = null
				namespace = null;
			} else {
				// 4.b. Else
				// 4.b.i. Let Namespace = GetDefaultNamespace()
				namespace = GetDefaultNamespace();
			}
		}

		// 6. If Namespace == null
		var uri;
		if(namespace === null) {
			// 6.a. Let q.uri = null
			uri = null;

			// NOTE implementations that preserve prefixes in qualified names
			// may also set q.[[Prefix]] to undefined
		} else {
			// 7. Else
			// 7.a. Let Namespace be a new Namespace created as if by calling
			//      the constructor new Namespace(Namespace)
			// 7.b. Let q.uri = Namespace.uri
			uri = new Namespace(namespace).uri;

			// NOTE implementations that preserve prefixes in qualified names
			// may also set q.[[Prefix]] to Namespace.prefix
		}

		// 5. Let q be a new QName with q.localName = Name
		// 13.3.5.1 localName
		//defineValue(this, 'localName', name);
		// 13.3.5.2 uri
		//defineValue(this, 'uri', uri);
		this.localName = name;
		this.uri = uri;

		// 8. Return q
		//return this;  // Implied.
	}

	defineValue(QName, 'toString', makeClassToString('QName'));

	// 13.3.4.1 QName.prototype.constructor
	defineValue(QName.prototype, 'constructor', QName);

	// 13.3.4  Properties of the QName Prototype Object
	defineMethods(QName, {
		// 13.3.4.2 QName.prototype.toString()
		'toString': function toString() {
			// 1. If Type(n) is not Object or n.[[Class]] is not equal to "QName", throw a TypeError exception
			__cast(this, QName);

			// 2. Let s be the empty string
			var s = '';

			// 3. If n.uri is not the empty string
			if(this.uri !== '') {
				// 3.a. If n.uri == null, let s be the string "*::"
				if(this.uri === null) {
					s = '*::';
				} else {
					// 3.b. Else let s be the result of concatenating n.uri and the string "::"
					s = this.uri + '::';
				}
			}

			// 4. Let s be the result of concatenating s and n.localName
			// 5. Return s
			return s + this.localName;
		}
	});

	function add_XML_XML(a, b) {
		return new XMLList([a[NODE], b[NODE]]);
	}

	function add_XML_XMLList(a, b) {
		return new XMLList([a[NODE]].concat(b[NODES]));
	}

	function add_XMLList_XML(a, b) {
		return new XMLList(a[NODES].concat([b[NODE]]));
	}

	function add_XMLList_XMLList(a, b) {
		return new XMLList(a[NODES].concat(b[NODES]));
	}

	var add = {
		aa: add_XML_XML,
		ab: add_XML_XMLList,
		ba: add_XMLList_XML,
		bb: add_XMLList_XMLList,
	};

	// 11.5 Equality Operators
	// See also sp/eq.js

	// 3.a. If Type(x) is XML,
	function eq_XML_XML(x, y) {
		var xNode = x[NODE];
		var yNode = y[NODE];

		// 3.a.i. If ((x.[[Class]] ∈ {"text", "attribute"}) and (y.hasSimpleContent())
		//        or ((y.[[Class]] ∈ {"text", "attribute"}) and (x.hasSimpleContent())
		if((isTextOrAttribute(xNode) && y.hasSimpleContent())
		|| (isTextOrAttribute(yNode) && x.hasSimpleContent())) {
			// 3.a.i.1. Return the result of the comparison ToString(x) == ToString(y)
			return String(x) === String(y);
		}

		// 3.a.ii. Else return the result of calling the [[Equals]] method of x with argument y
		return eq_XML_any(x, y);
	}

	// 3.b. If Type(x) is Object and x.[[Class]] == "QName"
	//      and y.[[Class]] == "QName"
	function eq_QName_QName(x, y) {
		// 3.b.i. If the result of the comparison x.uri == y.uri is true and
		//        the result of the comparison x.localName == y.localName is
		//        true, return true. Otherwise, return false
		return x.uri === y.uri && x.localName && y.localName;
	}

	// 3.c. If Type(x) is Object and x.[[Class]] == "Namespace"
	//      and y.[[Class]] == "Namespace", return the results of the
	//      comparison x.uri == y.uri
	function eq_Namespace_Namespace(x, y) {
		return x.uri === y.uri;
	}

	function eq_XML_any(xml, x) {
		// 4. If (Type(x) is XML and x.hasSimpleContent() == true)
		//    or (Type(y) is XML and y.hasSimpleContent() == true)
		if(xml.hasSimpleContent()) {
			return String(xml) === String(x);
		} else {
			return x == y;  // Fuzzy
		}
	}

	function typeLetter(x) {
		switch(true) {
			case __instanceof(x, XML): return 'a';
			case __instanceof(x, XMLList): return 'b';
			case __instanceof(x, QName): return 'c';
			case __instanceof(x, Namespace): return 'd';
			default: return '';
		}
	}

	// 11.5 Equality Operators
	function eqDispatch(x, y) {
		var xTypeLetter = typeLetter(x);
		var yTypeLetter = typeLetter(y);

		// 1. If Type(x) is XMLList, call the [[Equals]] method of x with
		//    argument y and return the result
		if(xTypeLetter === 'b') {
			return XMLList_Equals(x, y);
		}

		// 2. If Type(y) is XMLList, call the [[Equals]] method of y with
		//    argument x and return the result
		if(yTypeLetter === 'b') {
			return XMLList_Equals(y, x);
		}

		// Dynamic double dispatch by type
		if(xTypeLetter === yTypeLetter && xTypeLetter) {
			var lut = {
				a: eq_XML_XML,
				c: eq_QName_QName,
				d: eq_Namespace_Namespace
			};

			return lut[xTypeLetter](x, y);
		}

		if(xTypeLetter === 'a') {
			return eq_XML_any(x, y);
		}

		if(xTypeLetter === 'b') {
			return eq_XML_any(y, x);
		}

		return x == y;  // Fuzzy
	}

	return {
		a: XML,
		b: XMLList,
		c: QName,
		d: Namespace,
		e: add,
		f: eqDispatch
	};
});
