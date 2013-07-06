var fs = require('fs');
var path = require('path');
var vm = require('vm');

function derequire(filenames, baseUrl, output, blacklist) {
    var loadedFiles = [ ];

    function getModuleName(name) {
        return 'derequire_module__' + name.replace(/[^a-z]/gi, '_');
    }

    function getModuleFilename(name) {
        return path.join(baseUrl, name) + '.js';
    }

    function loadFile(filename) {
        if (loadedFiles.indexOf(filename) >= 0) {
            // Already loaded
            return;
        }

        var code = fs.readFileSync(filename);

		try {
		    vm.runInNewContext(code, {
		        require: myRequire,
		        define: myDefine
		    }, filename);
		} catch(e) {
			console.error('Error in file: ' + filename.replace(new RegExp('^' + baseUrl, 'g'), ''));
			console.error(e.stack);
			process.exit(1);
		}

        loadedFiles.push(filename);
    }

    function loadModule(name) {
        if (blacklist.indexOf(name) >= 0) {
            return;
        }

        loadFile(getModuleFilename(name));
    }

    function myRequire(config, deps, callback) {
        deps.forEach(loadModule);

        var fn = callback.toString();
        var args = /\(([^]*?)\)/.exec(fn)[1].trim().split(/[,\s\r\n]+/g);
        var body = fn.substr(fn.indexOf('{') + 1).replace(/}[\s\r\n]*$/g, '');

        output.write('(function (' + args.join(', ') + ') {\n');
        output.write(body);
        output.write('}(' + deps.map(getModuleName).join(', ') + '));\n');
    }

    function myDefine(name, deps, callback) {
        try {
            deps.forEach(loadModule);
        } catch (e) {
            if (e.code === 'EBADF') {
                console.error('Error including dependency for module ' + name);
            }

            throw e;
        }

        output.write('var ' + getModuleName(name) + ' = ');
        myRequire({ }, deps, callback);
    }

    output.write('(function () {\n');
    filenames.forEach(loadFile);
    output.write('}());\n');
}

derequire(process.argv.slice(3), process.argv[2], process.stdout, [ ]);
