/**
 * Internal debug flag
 *
 * @const
 */
var DEBUG = true;

/**
 * Customer debug flag
 *
 * @const
 */
var CUSTOMER_DEBUG = true;

var PROFILE = false;

(function() {
	function unrequire() {
		/*
		unrequire.js

		Copyright 2011 Sibblingz, Inc.

		Licensed under MIT
		*/
		// 0.3.1a +all
		//(function(){function s(b){function f(){var a=j.apply(null,arguments),b=a.deps,c=a.callback,d=m(n,a.config);q(function(a,f){if(a)throw a;l(d,f);var h=b.map(function(a){return k(a,d)},void 0);e(h,d,function(a,d){if(a)throw a;g.userCallback(null,c,d,h,b.slice(),function(a){if(a)throw a})})})}function e(b,c,e){function f(){if(!j){var a;for(a=0;a<b.length;++a)if(!g[a])return;j=!0,e(null,i,b)}}var g=[],i=[],j=!1;b.map(function(b,e){var j=a(c._packageOwners,b)?c._packageOwners[b]:b;!a(x,j)&&!a(B,j)&&!a(A,j)&&d(j,c,function(a,d){var e=m(c,{});e.cwd=h(j),e.scriptName=b,d.map(function(b){b(a,e)},void 0);if(a)throw a}),r(b,function(a,b){if(a)throw a;g[e]=!0,i[e]=b,f()})},void 0),f()}function d(b,c,d){function e(a){--y;var c=z;z=[],a||c.length===0&&console.warn("Possibly missing define for script "+b),d(a,c)}if(a(x,b)||a(B,b)||a(A,b))throw Error("Should not request "+b+" again");x[b]=!0,++y,g.loadScriptSync&&g.loadScriptSync(b,c)?e(null):g.loadScriptAsync?g.loadScriptAsync(b,e,c):e(Error("Failed to load script"))}var g=c({require:f,define:function(){var b=i.apply(null,arguments),d=b.name,f=b.deps,h=b.callback,j=m(n,b.config);q(function(b,i){if(b)throw b;c(c({},j),{}),l(j,i);var m;m=d?k(d,j):i.scriptName,p(m,function(){var b=f.map(function(a){return k(a,j)},void 0);e(b,j,function(c,d){if(c)throw c;g.userCallback(m,h,d,b,f.slice(),function(b,c){if(b)throw b;if(a(B,m))throw Error("Should not push value for "+m+" again");B[m]=c,o(m)})})})})},reconfigure:function(a){c(g,a)},userCallback:function(a,b,c,d,e,f){typeof b=="function"?(b.length===3&&e.length===0&&(c=[function(){throw Error("Not supported")},{},{}]),a=b.apply(null,c),b.length===3&&e.length===0&&typeof a=="undefined"&&(a=c[1])):a=b,f(null,a)}},b),n={cwd:".",baseUrl:"."};g.configuration=b,f.config=function(a){l(n,a)},f.debug=function(){console.log("Pulling:",C)};return g}function r(b,c){a(C,b)?C[b].push(c):C[b]=[c],n(b),o(b)}function q(a){y>0?z.push(a):a(null,{})}function p(b,c){a(A,b)?A[b].push(c):A[b]=[c],n(b)}function o(b){if(a(C,b)&&a(B,b)){var c=C[b];delete C[b],c.map(function(a){a(null,B[b])},void 0)}}function n(b){if(a(C,b)&&a(A,b)){var c=A[b];delete A[b],c.map(function(a){a()},void 0)}}function m(a,b){var d=c(c({},a),{});l(d,b);return d}function l(b,d){a(d,"baseUrl")&&(b.baseUrl=g(b.cwd,b.baseUrl,d.baseUrl)),a(d,"cwd")&&(b.cwd=d.cwd),b._aliases=a(b,"_aliases")?c(c({},b._aliases),{}):{},a(d,"_aliases")&&c(b._aliases,d._aliases);if(a(d,"aliases"))for(var e in d.aliases)a(d.aliases,e)&&(b._aliases[e]=k(d.aliases[e],b));b._packageOwners=a(b,"_packageOwners")?c(c({},b._packageOwners),{}):{},a(d,"_packageOwners")&&c(b._packageOwners,d._packageOwners);if(a(d,"packages"))for(var f in d.packages)if(a(d.packages,f)){var h=k(f,b);d.packages[f].map(function(a){b._packageOwners[k(a,b)]=h},void 0)}}function k(b,c){if(a(c._aliases,b))return c._aliases[b];var d=g(c.cwd,c.baseUrl,b);d+=/\.js$/i.test(d)?"":".js";return d}function j(a,c,d){if(typeof a=="string")throw Error("Not supported");u.call(a)!=="[object Object]"&&(d=c,c=a,a={}),b(c)||(d=c,c=[]);return{config:a,deps:c,callback:d}}function i(a,c,d,e){typeof a!="string"&&(e=d,d=c,c=a,a=null),u.call(c)!=="[object Object]"&&(e=d,d=c,c={}),b(d)||(e=d,d=[]);return{name:a,config:c,deps:d,callback:e}}function h(a){a=d(a),a=a.slice(0,a.length-1);return e(a)}function g(a,b,c){a=f(d(a)),b=f(d(b||v)),c=f(d(c));return c[0]===w||c[0]===v?e(f(a.concat(c))):c[0]===""?e(c):e(b.concat(c))}function f(a){var b=[],c;for(c=0;c<a.length;++c)a[c]?a[c]===w?b.length?b.length===1?b[0]===v||!b[0]?b=[w]:b.pop():b.pop():b=[w]:a[c]===v?b.length||(b=[v]):b.push(a[c]):b=[""];return b}function e(a){var b=a.join("/").replace(/\/+/g,"/");a.length===0&&a[0]===""&&(b="/"+b);return b}function d(a){var a=b(a)?a:[a],c=[],d;for(d=0;d<a.length;++d)c=c.concat(a[d].split(/\//g));return c}function c(b,c){for(var d in c)a(c,d)&&(b[d]=c[d]);return b}function b(a){return u.call(a)==="[object Array]"}function a(a,b){return a&&t.call(a,b)}var t={}.hasOwnProperty,u={}.toString,v=".",w="..",x={},y=0,z=[],A={},B={},C={};(function(){var a;if(typeof loadScript=="function")a=s({loadScriptAsync:function(a,b){loadScript(a,function(){b(null)})},loadScriptSync:function(){return!1}}),require=a.require,define=a.define;else if(typeof window!="undefined"){var b=window.document,c=function(a){a=d(h(window.location.pathname)).concat(d(a)),a=f(a);return a[0]!==".."};a=s({loadScriptAsync:function(a,d){if(c(a)){var e=b.createElement("script");e.async=!0,e.onload=e.onreadystatechange=function(){var a;if(!e.readyState||/loaded|complete/.test(e.readyState)){var b=e.parentNode;b&&b.removeChild(e),a=e.onload=e.onreadystatechange=e.onerror=null,e=a,d(null)}},e.onerror=function(){d(Error())},e.src=a,b.head.appendChild(e)}else setTimeout(function(){d(Error("Path "+a+" is not clean"))},0)},loadScriptSync:function(){return!1}}),window.require=a.require,window.define=a.define}else if(typeof module!="undefined")a=module.exports=s({context:{},loadScriptAsync:function(a,b){b(Error("Error loading module "+a+": not supported"))},loadScriptSync:function(b){var c;try{c=require("fs").readFileSync(b)}catch(d){return!1}require("vm").runInNewContext(c,a.context||{},b);return!0}});else throw Error("Unsupported environment")})()})()

;// I am awesome
(function () {
/**@const*/ var COMMONJS_COMPAT = true;
/**@const*/ var ENABLE_ALIASES = true;
/**@const*/ var ENABLE_BROWSER = true;
/**@const*/ var ENABLE_NODEJS = true;
/**@const*/ var ENABLE_SPACEPORT = true;
/**@const*/ var BROWSER_SYNC = false;
/**@const*/ var ENABLE_PACKAGES = true;
/**@const*/ var LOGGING = true;
/**@const*/ var WARNINGS = true;
/**@const*/ var CHECK_CYCLES = true;
/** @preserve
 * unrequire.js
 *
 * Copyright 2011 Sibblingz, Inc.
 *
 * Licensed under MIT
 */



    // MIT: http://trac.webkit.org/wiki/DetectingWebKit
    var IS_WEBKIT = typeof navigator !== 'undefined' && navigator && / AppleWebKit\//.test(navigator.userAgent);

    var HAS_SETTIMEOUT = typeof setTimeout === 'function';


    // Utility functions {{{
    var hasOwnProperty = ({ }).hasOwnProperty;
    var toString = ({ }).toString;

    // For minification
    var dot = '.';
    var dotdot = '..';

    function hasOwn(obj, name) {
        return obj && hasOwnProperty.call(obj, name);
    }

    function isArray(x) {
        return toString.call(x) === '[object Array]';
    }

    function isPlainOldObject(x) {
        return toString.call(x) === '[object Object]';
    }

    function map(array, fn, context) {
        // TODO Fallback if Function.prototype.map is missing
        return array.map(fn, context);
    }

    var forEach = map;

    function extend(base, extension) {
        var key;

        for (key in extension) {
            if (hasOwn(extension, key)) {
                base[key] = extension[key];
            }
        }

        return base;
    }

    function clone(object, extension) {
        return extend(extend({ }, object), extension || { });
    }
    // Utility functions }}}

    // Path functions {{{
    function stringToPath(parts) {
        parts = isArray(parts) ? parts : [ parts ];

        var splitParts = [ ];
        var i;

        for (i = 0; i < parts.length; ++i) {
            splitParts = splitParts.concat(parts[i].split(/\//g));
        }

        return splitParts;
    }

    function pathToString(path) {
        var s = path
            .join('/')
            .replace(/\/+/g, '/');

        if (path.length === 0 && path[0] === '') {
            s = '/' + s;
        }

        return s;
    }

    function normalizePath(path) {
        var newPath = [ ];
        var i;

        for (i = 0; i < path.length; ++i) {
            if (!path[i]) {
                // Root
                newPath = [ '' ];
            } else if (path[i] === dotdot) {
                // Go back
                if (!newPath.length) {
                    newPath = [ dotdot ];
                } else if (newPath.length === 1) {
                    if (newPath[0] === dot || !newPath[0]) {
                        newPath = [ dotdot ];
                    } else {
                        newPath.pop();
                    }
                } else {
                    newPath.pop();
                }
            } else if (path[i] === dot) {
                // Go here
                if (!newPath.length) {
                    newPath = [ dot ];
                }
            } else {
                // Everything else
                newPath.push(path[i]);
            }
        }

        return newPath;
    }

    function resolveUrl(cwd, baseUrl, path) {
        var cwdPath = normalizePath(stringToPath(cwd));
        var basePath = normalizePath(stringToPath(baseUrl || dot));
        var npath = normalizePath(stringToPath(path));

        if (npath[0] === dotdot || npath[0] === dot) {
            // Relative paths are based on cwd
            return pathToString(normalizePath(cwdPath.concat(npath)));
        } else if (npath[0] === '') {
            // Absolute path stays absolute
            return pathToString(npath);
        } else {
            // Implicit relative paths are based on baseUrl
            return pathToString(basePath.concat(npath));
        }
    }

    function resolveCwd(baseUrl, cwd) {
        var basePath = normalizePath(stringToPath(baseUrl || dot));
        var npath = normalizePath(stringToPath(cwd));

        if (npath[0] === dotdot || npath[0] === dot) {
            // Relative paths are absolute
            return pathToString(npath);
        } else if (npath[0] === '') {
            // Absolute path stays absolute
            return pathToString(npath);
        } else {
            // Implicit relative paths are based on baseUrl
            return pathToString(basePath.concat(npath));
        }
    }

    function dirname(url) {
        var path = stringToPath(url);
        path = path.slice(0, path.length - 1);
        return pathToString(path);
    }
    // Path functions }}}

    // Argument extraction functions {{{
    function defArgs(name, config, deps, callback) {
        if (typeof name !== 'string') {
            // Name omitted
            callback = deps;
            deps = config;
            config = name;
            name = null;
        }

        if (!isPlainOldObject(config)) {
            // Config omitted
            callback = deps;
            deps = config;
            config = { };
        }

        if (!isArray(deps)) {
            // Dependencies omitted
            callback = deps;
            deps = [ ];
        }

        return {
            name: name,
            config: config,
            deps: deps,
            callback: callback
        };
    }

    function reqArgs(config, deps, callback) {
        // TODO require(string)
        if (typeof config === 'string') {
            throw new Error('Not supported');
        }

        if (!isPlainOldObject(config)) {
            // Config omitted
            callback = deps;
            deps = config;
            config = { };
        }

        if (!isArray(deps)) {
            // Dependencies omitted
            callback = deps;
            deps = [ ];
        }

        return {
            config: config,
            deps: deps,
            callback: callback
        };
    }
    // Argument extraction functions }}}

    function getScriptName(moduleName, config) {
        if (ENABLE_ALIASES) {
            if (hasOwn(config._aliases, moduleName)) {
                return config._aliases[moduleName];
            }
        }

        var scriptName = resolveUrl(config.cwd, config.baseUrl, moduleName);
        scriptName = scriptName + (/\.js$/i.test(scriptName) ? '' : '.js');
        return scriptName;
    }

    function mergeConfigInto(base, augmentation) {
        // The order of these checks are important, because changes cascade

        if (hasOwn(augmentation, 'baseUrl')) {
            base.baseUrl = resolveUrl(base.cwd, base.baseUrl, augmentation.baseUrl);
        }

        if (hasOwn(augmentation, 'cwd')) {
            base.cwd = augmentation.cwd;
            //base.cwd = resolveCwd(base.baseUrl, augmentation.cwd);
        }

        if (ENABLE_ALIASES) {
            if (hasOwn(base, '_aliases')) {
                base._aliases = clone(base._aliases);
            } else {
                base._aliases = { };
            }

            if (hasOwn(augmentation, '_aliases')) {
                extend(base._aliases, augmentation._aliases);
            }

            if (hasOwn(augmentation, 'aliases')) {
                var aliasName;
                for (aliasName in augmentation.aliases) {
                    if (!hasOwn(augmentation.aliases, aliasName)) {
                        continue;
                    }

                    var aliasTarget = augmentation.aliases[aliasName];

                    // Aliases are stored as their full script name
                    base._aliases[aliasName] = getScriptName(aliasTarget, base);
                }
            }
        }

        if (ENABLE_PACKAGES) {
            if (hasOwn(base, '_packageOwners')) {
                base._packageOwners = clone(base._packageOwners);
            } else {
                base._packageOwners = { };
            }

            if (hasOwn(augmentation, '_packageOwners')) {
                extend(base._packageOwners, augmentation._packageOwners);
            }

            if (hasOwn(augmentation, 'packages')) {
                var packageName;
                for (packageName in augmentation.packages) {
                    if (!hasOwn(augmentation.packages, packageName)) {
                        continue;
                    }

                    var packageOwner = getScriptName(packageName, base);
                    forEach(augmentation.packages[packageName], function (moduleName) {
                        base._packageOwners[getScriptName(moduleName, base)] = packageOwner;
                    });
                }
            }
        }
    }

    function mergeConfigs(first, second) {
        var base = clone(first);
        mergeConfigInto(base, second);
        return base;
    }

    function findCycles(graph, vertices) {
        var vertexIndices = { };
        var vertexLowLinks = { };

        var index = 0;
        var stack = [ ];

        var cycles = [ ];

        function strongConnect(v) {
            vertexIndices[v] = index;
            vertexLowLinks[v] = index;
            ++index;
            stack.push(v);

            if (hasOwn(graph, v)) {
                graph[v].forEach(function (w) {
                    if (!hasOwn(vertexIndices, w)) {
                        strongConnect(w);
                        vertexLowLinks[v] = Math.min(vertexLowLinks[v], vertexLowLinks[w]);
                    } else if (stack.indexOf(w) >= 0) {
                        vertexLowLinks[v] = Math.min(vertexLowLinks[v], vertexIndices[w]);
                    }
                });
            }

            if (vertexLowLinks[v] === vertexIndices[v]) {
                var cycle = [ ];
                var w;
                do {
                    w = stack.pop();
                    cycle.push(w);
                } while (w !== v);
                cycles.push(cycle);
            }
        }

        vertices.forEach(function (vertex) {
            if (!hasOwn(vertexIndices, vertex)) {
                strongConnect(vertex);
            }
        });

        return cycles;
    }

    // dependencyGraph :: Map String [String]
    var dependencyGraph = { };

    // pulledScripts :: [String]
    var pulledScripts = [ ];

    function addDependency(from, to) {
        if (hasOwn(dependencyGraph, from)) {
            dependencyGraph[from].push(to);
        } else {
            dependencyGraph[from] = [ to ];
        }
    }

    function checkCircularDependencies() {
        var cycles = findCycles(dependencyGraph, pulledScripts);

        cycles.forEach(function (cycle) {
            if (cycle.length > 1) {
                throw new Error('Circular dependency detected between scripts: ' + cycle.join(' '));
            }
        });
    }

    function getScriptsDependingUpon(scriptName) {
        var scripts = [ ];

        for (var curScript in dependencyGraph) {
            if (hasOwn(dependencyGraph, curScript)) {
                if (dependencyGraph[curScript].indexOf(scriptName) >= 0) {
                    scripts.push(curScript);
                }
            }
        }

        return scripts;
    }

    // requestedScripts :: Map String Bool
    var requestedScripts = { };

    // requestingScriptCount :: Int
    var requestingScriptCount = 0;

    // We have two queues here.
    //
    // The script complete queue is built up while executing scripts.  A define
    // call adds to this queue.  The queue is flushed when the script completes
    // execution.  This allows us to determine which script was executed
    // exactly for asynchronous loads.
    //
    // A load callback queue is built up after a define call knows its complete
    // name configuration.  It is executed when that defined module is
    // requested.  This allows for lazy loading of defiend modules, and also
    // allows for asynchronous module definitions.  There is a mapping of
    // script name to load callback queue, thus this queue is a hash and not an
    // array.

    // scriptCompleteQueue :: [Maybe Error -> Configuration -> IO ()]
    var scriptCompleteQueue = [ ];

    // loadCallbackQueues :: Map String [IO ()]
    var loadCallbackQueues = { };

    // The push-pull mechanism decouples requesters of a module from definers
    // of a module.  When a module is defined, it is "pushed"; when a module is
    // requested, it is "pulled".  If a pull is made on an already-pushed
    // module name, the pull callback is executed immediately.  Else, the pull
    // callback is executed immediately when the appropriate push is made.

    // pushed :: Map String a
    var pushed = { };

    // pulling :: Map String [Maybe Error -> a -> IO ()]
    var pulling = { };

    function checkPullForLoadCallback(scriptName) {
        if (hasOwn(pulling, scriptName) && hasOwn(loadCallbackQueues, scriptName)) {
            var callbacks = loadCallbackQueues[scriptName];
            delete loadCallbackQueues[scriptName];

            forEach(callbacks, function (callback) {
                callback();
            });
        }
    }

    function checkPullForPush(scriptName, value) {
        if (hasOwn(pulling, scriptName) && hasOwn(pushed, scriptName)) {
            var callbacks = pulling[scriptName];
            delete pulling[scriptName];

            forEach(callbacks, function (callback) {
                callback(null, pushed[scriptName]);
            });
        }
    }

    function enqueueLoadCallback(scriptName, callback) {
        if (hasOwn(loadCallbackQueues, scriptName)) {
            loadCallbackQueues[scriptName].push(callback);
        } else {
            loadCallbackQueues[scriptName] = [ callback ];
        }

        checkPullForLoadCallback(scriptName);
    }

    function enqueueScriptCompleteCallback(callback) {
        if (requestingScriptCount > 0) {
            scriptCompleteQueue.push(callback);
        } else {
            callback(null, { });
        }
    }

    function push(scriptName, value) {
        if (hasOwn(pushed, scriptName)) {
            throw new Error('Should not push value for ' + scriptName + ' again');
        }

        pushed[scriptName] = value;

        checkPullForPush(scriptName);
    }

    function pull(scriptName, callback) {
        if (CHECK_CYCLES) {
            pulledScripts.push(scriptName);
        }

        if (hasOwn(pulling, scriptName)) {
            pulling[scriptName].push(callback);
        } else {
            pulling[scriptName] = [ callback ];
        }

        checkPullForLoadCallback(scriptName);
        checkPullForPush(scriptName);
    }

    function needsRequest(scriptName) {
        return !hasOwn(requestedScripts, scriptName) && !hasOwn(pushed, scriptName) && !hasOwn(loadCallbackQueues, scriptName);
    }

    // Entry points {{{
    function create(configuration) {
        var context = extend({
            'require': req,
            'define': def,
            'reconfigure': reconfigure,
            'userCallback': defaultUserCallback
        }, configuration);

        var baseConfig = {
            cwd: '.',
            baseUrl: '.'
        };

        context.configuration = configuration;
        req.config = config;
        req.debug = debug;

        return context;

        function config(config) {
            mergeConfigInto(baseConfig, config);
        }

        function defaultUserCallback(scriptName, data, moduleValues, moduleScripts, moduleNames, callback) {
            if (LOGGING) {
                console.log('Executing', scriptName);
            }

            var moduleValue;
            if (typeof data === 'function') {
                if (COMMONJS_COMPAT && data.length === 3 && moduleNames.length === 0) {
                    moduleValues = [
                        // require
                        function () {
                            throw new Error('Not supported');
                        },

                        // exports
                        { },

                        // module
                        { } // TODO
                    ];
                }

                moduleValue = data.apply(null, moduleValues);

                if (COMMONJS_COMPAT && data.length === 3 && moduleNames.length === 0) {
                    if (typeof moduleValue === 'undefined') {
                        moduleValue = moduleValues[1]; // exports
                    }
                }
            } else {
                moduleValue = data;
            }

            callback(null, moduleValue);
        }

        function reconfigure(configuration) {
            extend(context, configuration);
        }

        function getRequestScriptName(scriptName, config) {
            if (ENABLE_PACKAGES) {
                if (hasOwn(config._packageOwners, scriptName)) {
                    return config._packageOwners[scriptName];
                }
            }

            return scriptName;
        }

        function request(scriptName, config, callback) {
            if (!needsRequest(scriptName)) {
                throw new Error('Should not request ' + scriptName + ' again');
            }

            if (LOGGING) {
                console.log('Requesting script ' + scriptName);
            }

            requestedScripts[scriptName] = true;
            ++requestingScriptCount;

            function done(err) {
                --requestingScriptCount;

                var scriptCompleteCallbacks = scriptCompleteQueue;
                scriptCompleteQueue = [ ];

                if (!err) {
                    if (scriptCompleteCallbacks.length === 0) {
                        console.warn('Possibly missing define for script ' + scriptName);
                    }
                }

                callback(err, scriptCompleteCallbacks);
            }

            function tryAsync() {
            }

            // Try a sync load first
            if (context.loadScriptSync) {
                // We have this setTimeout logic to handle exceptions thrown by
                // loadScriptSync.  We do not catch exceptions (so debugging is
                // easier for users), or deal with the 'finally' mess, but
                // still call done().
                var timer;
                if (HAS_SETTIMEOUT) {
                    timer = setTimeout(function () {
                        done(new Error('Script threw exception'));
                    }, 0);
                }

                var success = context.loadScriptSync(scriptName, config);

                if (HAS_SETTIMEOUT) {
                    clearTimeout(timer);
                }

                if (success) {
                    done(null);
                    return;
                }
            }

            if (context.loadScriptAsync) {
                return context.loadScriptAsync(scriptName, done, config);
            }

            done(new Error('Failed to load script'));
        }

        function requestAndPullMany(scriptNames, config, callback) {
            var loaded = [ ];
            var values = [ ];
            var i;
            var called = false;

            function checkValues() {
                if (called) return;

                var i;

                for (i = 0; i < scriptNames.length; ++i) {
                    if (!loaded[i]) return;
                }

                called = true;
                callback(null, values, scriptNames);
            }

            forEach(scriptNames, function (scriptName, i) {
                var requestScriptName = getRequestScriptName(scriptName, config);

                if (needsRequest(requestScriptName)) {
                    request(requestScriptName, config, function (err, callbacks) {
                        var neoConfig = mergeConfigs(config, { });
                        neoConfig.cwd = dirname(requestScriptName);
                        neoConfig.scriptName = scriptName;

                        forEach(callbacks, function (callback) {
                            callback(err, neoConfig);
                        });

                        if (err) {
                            var errorString = 'Failed to load ' + requestScriptName;

                            var dependers = getScriptsDependingUpon(requestScriptName);
                            if (dependers.length) {
                                errorString += ' (depended upon by ' + dependers.join(', ') + ')';
                            }

                            console.error(errorString, err);
                        }
                    });
                }

                pull(scriptName, function (err, value) {
                    if (err) throw err;

                    loaded[i] = true;
                    values[i] = value;
                    checkValues();
                });
            });

            // In case we have no scripts to load
            checkValues();
        }

        function req() {
            // TODO require(string)

            var args = reqArgs.apply(null, arguments);
            var config = args.config;
            var deps = args.deps;
            var callback = args.callback;

            if (LOGGING) {
                console.log('Requiring [ ' + (deps || [ ]).join(', ') + ' ]');
            }

            var effectiveConfig = mergeConfigs(baseConfig, config);

            enqueueScriptCompleteCallback(function (err, config) {
                if (err) throw err;

                mergeConfigInto(effectiveConfig, config);

                var scriptNames = map(deps, function (dep) {
                    return getScriptName(dep, effectiveConfig);
                });

                requestAndPullMany(scriptNames, effectiveConfig, function (err, values) {
                    if (err) throw err;

                    context.userCallback(null, callback, values, scriptNames, deps.slice(), function (err, value) {
                        if (err) throw err;

                        // Ignore value
                    });
                });
            });
        }

        function def() {
            var args = defArgs.apply(null, arguments);
            var name = args.name;
            var config = args.config;
            var deps = args.deps;
            var callback = args.callback;

            if (LOGGING) {
                console.log('Defining ' + (name || 'unnamed package') + ' with dependencies [ ' + (deps || [ ]).join(', ') + ' ]');
            }

            var effectiveConfig = mergeConfigs(baseConfig, config);

            enqueueScriptCompleteCallback(function (err, config) {
                if (err) throw err;

                var oldEffectiveConfig = clone(effectiveConfig);

                // Script name resolution should occur *before* merging config into
                // effectiveConfig
                mergeConfigInto(effectiveConfig, config);

                var scriptName;
                if (name) {
                    scriptName = getScriptName(name, effectiveConfig);
                } else {
                    scriptName = config.scriptName;
                }

                enqueueLoadCallback(scriptName, function () {
                    var scriptNames = map(deps, function (dep) {
                        return getScriptName(dep, effectiveConfig);
                    });

                    if (CHECK_CYCLES) {
                        map(scriptNames, function (dep) {
                            addDependency(scriptName, dep);
                        });
                    }

                    checkCircularDependencies();

                    requestAndPullMany(scriptNames, effectiveConfig, function (err, values) {
                        if (err) throw err;

                        context.userCallback(scriptName, callback, values, scriptNames, deps.slice(), function (err, value) {
                            if (err) throw err;

                            push(scriptName, value);
                        });
                    });
                });
            });
        }

        function debug() {
            console.log('Pulling:', pulling);
        }
    }
    // Entry points }}}

    (function () {
        var un;

        if (ENABLE_SPACEPORT && typeof loadScript === 'function') {
            // Must be first, because Spaceport has the window object, too.
            un = create({
                'loadScriptAsync': function (scriptName, callback) {
                    loadScript(scriptName, function () {
                        callback(null);
                    });
                },
                'loadScriptSync': function (scriptName) {
                    return false;
                }
            });

            // Set globals
            require = un['require'];
            define = un['define'];
        } else if (ENABLE_BROWSER && typeof window !== 'undefined') {
            var goodResponseCodes = [ 200, 204, 206, 301, 302, 303, 304, 307 ];
            var doc = window.document;

            var onreadystatechange = 'onreadystatechange';
            var onload = 'onload';
            var onerror = 'onerror';

            function isCleanPath(scriptName) {
                // If the path is "back" too much, it's not clean.
                var x = stringToPath(dirname(window.location.pathname))
                    .concat(stringToPath(scriptName));
                x = normalizePath(x);
                return x[0] !== '..';
            }

            var webkitOnloadFlag = false;

            un = create({
                'loadScriptAsync': function loadScriptAsync(scriptName, callback) {
                    if (!isCleanPath(scriptName)) {
                        setTimeout(function () {
                            callback(new Error('Path ' + scriptName + ' is not clean'));
                        }, 0);
                        return;
                    }

                    var script = doc.createElement('script');
                    script.async = true;

                    // Modelled after jQuery (src/ajax/script.js)
                    script[onload] = script[onreadystatechange] = function () {
                        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                            // Remove from DOM
                            var parent = script.parentNode;
                            if (parent) {
                                parent.removeChild(script);
                            }

                            // IE likes memleaks
                            script[onload] = script[onreadystatechange] = script[onerror] = null;
                            script = null;

                            callback(null);
                        }
                    };

                    script[onerror] = function () {
                        callback(new Error('Failed to load script'));
                    };

                    // Remember: we need to attach event handlers before
                    // assigning `src`.  Events may be fired as soon as we set
                    // `src`.
                    script.src = scriptName;

                    doc['head'].appendChild(script);
                },
                'loadScriptSync': function loadScriptSync(scriptName) {
                    // We provide synchronous script loading via XHR for
                    // browsers specifically to work around a Webkit bug.
                    // After document.onload is called, any script dynamically
                    // loaded will be loaded from Webkit's local cache; *no
                    // HTTP request is made at all*.

                    if (!BROWSER_SYNC) {
                        if (IS_WEBKIT) {
                            if (/loaded|complete/.test(document.readyState)) {
                                // Don't load synchronously if the document has already loaded
                                if (WARNINGS && !webkitOnloadFlag) {
                                    console.warn('Scripts being loaded after document.onload; scripts may be loaded from out-of-date cache');
                                    webkitOnloadFlag = true;
                                }

                                if (WARNINGS) {
                                    console.warn('Script possibly loaded from out-of-date cache: ' + scriptName);
                                }

                                return false;
                            }

                            // Fall through; load synchronously anyway
                        } else {
                            return false;
                        }
                    }

                    if (!isCleanPath(scriptName)) {
                        return false;
                    }

                    var scriptSource;

                    try {
                        var xhr = new XMLHttpRequest();
                        xhr.open('GET', scriptName, false);
                        xhr.send(null);

                        if (goodResponseCodes.indexOf(xhr.status) < 0) {
                            return false;
                        }

                        scriptSource = xhr.responseText;
                        scriptSource += '\n\n//*/\n//@ sourceURL=' + scriptName;
                    } catch (e) {
                        return false;
                    }

                    var fn;
                    try {
                        fn = Function(scriptSource);
                    } catch (e) {
                        return false;
                    }

                    // Don't wrap user code in try/catch
                    fn();

                    return true;
                }
            });

            window['require'] = un['require'];
            window['define'] = un['define'];
        } else if (ENABLE_NODEJS && typeof module !== 'undefined') {
            un = module.exports = create({
                'context': { },
                'loadScriptSync': function (scriptName) {
                    // require here is the Node.JS-provided require

                    var code;
                    try {
                        code = require('fs')['readFileSync'](scriptName, 'utf8');
                    } catch (e) {
                        // TODO Detect file-not-found errors only
                        return false;
                    }

                    require('vm')['runInNewContext'](code, un['context'] || { }, scriptName);

                    return true;
                }
            });

            un['context']['define'] = un['define'];
            un['context']['require'] = un['require'];
        } else {
            throw new Error('Unsupported environment');
        }
    }());

}());
	}

	var env = null;

	if(typeof window !== 'undefined') {
		env = 'browser';
	} else if(typeof Packages !== 'undefined') {
		env = 'rhino';
	} else if(typeof process !== 'undefined') {
		env = 'node';
	}

	var initializers = {
		browser: function browser() {
				// Find this <script> instance to detect the base
				// path.  This is totally hacky, but whatever; it
				// won't be used in production anyway.
			var basePath = '.';
			var re = /\/+.*(\/.*)\/spaceport-html5(-dev|-test|)\.js(\?.*$)?/;

			var scripts = document.getElementsByTagName('script');

			for(var i=0; scripts[i]; ++i) {
				var r = re.exec(scripts[i].src);

				if(r)
					basePath = r[1];
			}

			unrequire(/* undefined */);

			// nodecompat *must* be included before main
			var opts = {
				baseUrl: basePath + '/spaceport-html5',
				context: 'spaceport-html5'
			};

			require(opts, ['main']);
		}
	};

	if(!Object.prototype.hasOwnProperty.call(initializers, env)) {
		throw new Error('Unknown environment');
	}

	initializers[env].call();
}());
