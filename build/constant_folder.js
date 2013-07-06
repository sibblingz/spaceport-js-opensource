var vm = require('vm');

function hasOwnProperty(obj, key) {
	return Object.prototype.hasOwnProperty.call(obj, key);
}

function exec(code) {
	var sandbox = {
		module: { },
		
		console: console,
		setTimeout: setTimeout,
		setInterval: setInterval,
		clearTimeout: clearTimeout,
		clearInterval: clearInterval,
		
		// GOD DAMNIT
		ArrayBuffer: ArrayBuffer,
		Int8Array: Int8Array,
		Uint8Array: Uint8Array,
		Int16Array: Int16Array,
		Uint16Array: Uint16Array,
		Int32Array: Int32Array,
		Uint32Array: Uint32Array,
		Float32Array: Float32Array,
		Float64Array: Float64Array
	};
	vm.runInNewContext(code, sandbox, 'stdin');
	var exports = sandbox.module.exports;
	
	// Get ALL the constants
	var constants = { };
	var excluded = [ ];
	Object.keys(exports).forEach(function(key) {
		var container = exports[key];

		if(!(typeof container === 'object' || typeof container === 'function'))
			return;

		if(container === null)
			return;

		Object.keys(container).forEach(function(constantName) {
			if(/^[A-Z_]+$/.test(constantName)) {
				var fullName = key + '.' + constantName;
				if(hasOwnProperty(constants, fullName)) {
					// Collision.  Do NOT inline the constant.
					excluded.push(fullName);
				}

				constants[fullName] = container[constantName];
			}
		});
	});

	return code.replace(/\b([A-Za-z_$]+\.)+([A-Z_]+)\b/g, function resolve(fullMatch, parent, constantName, index) {
		// Can't be folded in the regexp due to + on `parent` group
		var fullName = parent + constantName;

		if(!hasOwnProperty(constants, fullName) || excluded.indexOf(fullName) >= 0)
			return fullMatch;

		// Get the full line of the match
		var lineStartIndex = code.slice(0, index).lastIndexOf('\n') + 1;
		var lineEndIndex = index + code.slice(index).indexOf('\n');
		var lineText = code.slice(lineStartIndex, lineEndIndex);

		// If there's a comment, string, whatever, play it safe and bail.
		if(/['"\/]|\/\//.test(lineText))
			return fullMatch;

		var constant = JSON.stringify(constants[fullName]);
		if(constant.length < fullMatch.length)
			return constant;
		else
			return fullMatch;
	});
}

var input = process.stdin;
var output = process.stdout;

var inputString = '';
input.on('data', function(chunk) {
	inputString += chunk.toString('utf8');
});
input.on('end', function() {
	output.write(exec(inputString), 'utf8');
});

input.resume();
