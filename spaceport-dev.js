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

/**
 * Profiler flag
 *
 * If the YUI2 (YAHOO) profiler is included on the page, and the debug
 * flag is set, profiling is automatically enabled.
 *
 * @const
 */
var PROFILE = DEBUG ? typeof YAHOO !== 'undefined' && YAHOO.tool && YAHOO.tool.Profiler : false;

(function() {
	function unrequire(module) {
		/*
		unrequire.js

		Copyright 2011 Sibblingz, Inc.

		Licensed under MIT
		*/
		// 0.3.1a +all
		(function(){function s(b){function f(){var a=j.apply(null,arguments),b=a.deps,c=a.callback,d=m(n,a.config);q(function(a,f){if(a)throw a;l(d,f);var h=b.map(function(a){return k(a,d)},void 0);e(h,d,function(a,d){if(a)throw a;g.userCallback(null,c,d,h,b.slice(),function(a){if(a)throw a})})})}function e(b,c,e){function f(){if(!j){var a;for(a=0;a<b.length;++a)if(!g[a])return;j=!0,e(null,i,b)}}var g=[],i=[],j=!1;b.map(function(b,e){var j=a(c._packageOwners,b)?c._packageOwners[b]:b;!a(x,j)&&!a(B,j)&&!a(A,j)&&d(j,c,function(a,d){var e=m(c,{});e.cwd=h(j),e.scriptName=b,d.map(function(b){b(a,e)},void 0);if(a)throw a}),r(b,function(a,b){if(a)throw a;g[e]=!0,i[e]=b,f()})},void 0),f()}function d(b,c,d){function e(a){--y;var c=z;z=[],a||c.length===0&&console.warn("Possibly missing define for script "+b),d(a,c)}if(a(x,b)||a(B,b)||a(A,b))throw Error("Should not request "+b+" again");x[b]=!0,++y,g.loadScriptSync&&g.loadScriptSync(b,c)?e(null):g.loadScriptAsync?g.loadScriptAsync(b,e,c):e(Error("Failed to load script"))}var g=c({require:f,define:function(){var b=i.apply(null,arguments),d=b.name,f=b.deps,h=b.callback,j=m(n,b.config);q(function(b,i){if(b)throw b;c(c({},j),{}),l(j,i);var m;m=d?k(d,j):i.scriptName,p(m,function(){var b=f.map(function(a){return k(a,j)},void 0);e(b,j,function(c,d){if(c)throw c;g.userCallback(m,h,d,b,f.slice(),function(b,c){if(b)throw b;if(a(B,m))throw Error("Should not push value for "+m+" again");B[m]=c,o(m)})})})})},reconfigure:function(a){c(g,a)},userCallback:function(a,b,c,d,e,f){typeof b=="function"?(b.length===3&&e.length===0&&(c=[function(){throw Error("Not supported")},{},{}]),a=b.apply(null,c),b.length===3&&e.length===0&&typeof a=="undefined"&&(a=c[1])):a=b,f(null,a)}},b),n={cwd:".",baseUrl:"."};g.configuration=b,f.config=function(a){l(n,a)},f.debug=function(){console.log("Pulling:",C)};return g}function r(b,c){a(C,b)?C[b].push(c):C[b]=[c],n(b),o(b)}function q(a){y>0?z.push(a):a(null,{})}function p(b,c){a(A,b)?A[b].push(c):A[b]=[c],n(b)}function o(b){if(a(C,b)&&a(B,b)){var c=C[b];delete C[b],c.map(function(a){a(null,B[b])},void 0)}}function n(b){if(a(C,b)&&a(A,b)){var c=A[b];delete A[b],c.map(function(a){a()},void 0)}}function m(a,b){var d=c(c({},a),{});l(d,b);return d}function l(b,d){a(d,"baseUrl")&&(b.baseUrl=g(b.cwd,b.baseUrl,d.baseUrl)),a(d,"cwd")&&(b.cwd=d.cwd),b._aliases=a(b,"_aliases")?c(c({},b._aliases),{}):{},a(d,"_aliases")&&c(b._aliases,d._aliases);if(a(d,"aliases"))for(var e in d.aliases)a(d.aliases,e)&&(b._aliases[e]=k(d.aliases[e],b));b._packageOwners=a(b,"_packageOwners")?c(c({},b._packageOwners),{}):{},a(d,"_packageOwners")&&c(b._packageOwners,d._packageOwners);if(a(d,"packages"))for(var f in d.packages)if(a(d.packages,f)){var h=k(f,b);d.packages[f].map(function(a){b._packageOwners[k(a,b)]=h},void 0)}}function k(b,c){if(a(c._aliases,b))return c._aliases[b];var d=g(c.cwd,c.baseUrl,b);d+=/\.js$/i.test(d)?"":".js";return d}function j(a,c,d){if(typeof a=="string")throw Error("Not supported");u.call(a)!=="[object Object]"&&(d=c,c=a,a={}),b(c)||(d=c,c=[]);return{config:a,deps:c,callback:d}}function i(a,c,d,e){typeof a!="string"&&(e=d,d=c,c=a,a=null),u.call(c)!=="[object Object]"&&(e=d,d=c,c={}),b(d)||(e=d,d=[]);return{name:a,config:c,deps:d,callback:e}}function h(a){a=d(a),a=a.slice(0,a.length-1);return e(a)}function g(a,b,c){a=f(d(a)),b=f(d(b||v)),c=f(d(c));return c[0]===w||c[0]===v?e(f(a.concat(c))):c[0]===""?e(c):e(b.concat(c))}function f(a){var b=[],c;for(c=0;c<a.length;++c)a[c]?a[c]===w?b.length?b.length===1?b[0]===v||!b[0]?b=[w]:b.pop():b.pop():b=[w]:a[c]===v?b.length||(b=[v]):b.push(a[c]):b=[""];return b}function e(a){var b=a.join("/").replace(/\/+/g,"/");a.length===0&&a[0]===""&&(b="/"+b);return b}function d(a){var a=b(a)?a:[a],c=[],d;for(d=0;d<a.length;++d)c=c.concat(a[d].split(/\//g));return c}function c(b,c){for(var d in c)a(c,d)&&(b[d]=c[d]);return b}function b(a){return u.call(a)==="[object Array]"}function a(a,b){return a&&t.call(a,b)}var t={}.hasOwnProperty,u={}.toString,v=".",w="..",x={},y=0,z=[],A={},B={},C={};(function(){var a;if(typeof loadScript=="function")a=s({loadScriptAsync:function(a,b){loadScript(a,function(){b(null)})},loadScriptSync:function(){return!1}}),require=a.require,define=a.define;else if(typeof window!="undefined"){var b=window.document,c=function(a){a=d(h(window.location.pathname)).concat(d(a)),a=f(a);return a[0]!==".."};a=s({loadScriptAsync:function(a,d){if(c(a)){var e=b.createElement("script");e.async=!0,e.onload=e.onreadystatechange=function(){var a;if(!e.readyState||/loaded|complete/.test(e.readyState)){var b=e.parentNode;b&&b.removeChild(e),a=e.onload=e.onreadystatechange=e.onerror=null,e=a,d(null)}},e.onerror=function(){d(Error())},e.src=a,b.head.appendChild(e)}else setTimeout(function(){d(Error("Path "+a+" is not clean"))},0)},loadScriptSync:function(){return!1}}),window.require=a.require,window.define=a.define}else if(typeof module!="undefined")a=module.exports=s({context:{},loadScriptAsync:function(a,b){b(Error("Error loading module "+a+": not supported"))},loadScriptSync:function(b){var c;try{c=require("fs").readFileSync(b)}catch(d){return!1}require("vm").runInNewContext(c,a.context||{},b);return!0}});else throw Error("Unsupported environment")})()})()
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
			var re = /\/+.*(\/.*)\/spaceport(-dev|-test|)\.js(\?.*$)?/;

			var scripts = document.getElementsByTagName('script');

			for(var i=0; scripts[i]; ++i) {
				var r = re.exec(scripts[i].src);

				if(r)
					basePath = r[1];
			}

			unrequire(/* undefined */);

			// nodecompat *must* be included before main
			var opts = {
				baseUrl: basePath + '/spaceport',
				context: 'spaceport'
			};

			require(opts, ['nodecompat'], function() {
				require(opts, ['main']);
			});
		},
		node: function node() {
			var vm = require('vm');
			var path = require('path');

			var unModule = { };
			unrequire(unModule);
			var un = unModule.exports;
			var sandbox = {
				DEBUG: DEBUG,
				CUSTOMER_DEBUG: CUSTOMER_DEBUG,
				PROFILE: PROFILE,

				require: un.require,
				define: un.define,

				module: module,
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

			un.reconfigure({
				context: sandbox
			});

			// nodecompat *must* be included before main
			var opts = {
				baseUrl: path.join(__dirname, '/spaceport')
			};

			un.require(opts, ['nodecompat'], function() {
				un.require(opts, ['main'], function(sp) {
					module.exports = sp;
				});
			});
		}
	};

	if(!Object.prototype.hasOwnProperty.call(initializers, env)) {
		throw new Error('Unknown environment');
	}

	initializers[env].call();
}());
