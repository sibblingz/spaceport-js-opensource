define('bridge/flush', [
	'util/requestAnimFrame',
	'util/nextTick',
	'flash/Stage',
	'bridge/addToDictionary',
	'storage',
	'bridge/dictionary',
	'bridge/dataLookup',
	'bridge/classLookup',
	'queue',
	'buffer',
	'display/animatingMovieClips',
	'dom/svgNS',
	'gameLoop',
	'shared/internalError',
	'shared/objectKeys',
	'shared/version'
], function(
	requestAnimFrame,
	nextTick,
	Stage,
	addToDictionary,
	storage,
	dictionary,
	dataLookup,
	classLookup,
	queue,
	buffer,
	animatingMovieClips,
	svgNS,
	gameLoop,
	internalError,
	objectKeys,
	SPACEPORT_VERSION
) {
	var stage = null;

	function dynamicConstruct(cls, args)
	{
		var mapper = [
			function(c) { return new c(); },
			function(c, a1) { return new c(a1); },
			function(c, a1, a2) { return new c(a1, a2); },
			function(c, a1, a2, a3) { return new c(a1, a2, a3); },
			function(c, a1, a2, a3, a4) { return new c(a1, a2, a3, a4); },
			function(c, a1, a2, a3, a4, a5) { return new c(a1, a2, a3, a4, a5); },
			function(c, a1, a2, a3, a4, a5, a6) { return new c(a1, a2, a3, a4, a5, a6); },
			function(c, a1, a2, a3, a4, a5, a6, a7) { return new c(a1, a2, a3, a4, a5, a6, a7); },
			function(c, a1, a2, a3, a4, a5, a6, a7, a8) { return new c(a1, a2, a3, a4, a5, a6, a7, a8); }
		];
		
		args = args || [];
		return mapper[args.length].apply(null, [cls].concat(args));
	}

	var parseConstructArgument = (function() {
		function ParseError() {
		
		}
		
		function indexOf(haystack, needle) {
			var index = haystack.indexOf(needle);
			return index < 0 ? haystack.length : index;
		}
		
		function parseClassName(string) {
			// Input is: cName(...
			// Need to capture: ClassName, rest from (
			var e = /^c:([a-zA-Z]+)(?=\()/.exec(string);
			
			if(!e)
				throw new ParseError();
			
			var className = e[1];
			var rest = string.substr(e[0].length);
			
			return {
				name: className,
				rest: rest
			};
		}
		
		function parseArguments(string) {
			// Input is: (arg1, arg2, c(arg3), arg4) ...
			// Need to capture each parsed arg, rest after )
			if(string.charAt(0) !== '(')
				throw new ParseError();
			
			// Skip initial (
			string = string.substr(1);
			
			var args = [];
			while (string !== '') {
				var comma = indexOf(string, ',');
				var parenL = indexOf(string, '(');
				var parenR = indexOf(string, ')');
				
				if (parenR < comma && parenR < parenL) {
					// ) met before , or (; last argument
					args.push(string.substr(0, parenR));
					string = string.substr(parenR);
					break;
				} else if(comma < parenL && comma < parenR) {
					// , met before ( or ); new argument
					args.push(string.substr(0, comma));
					string = string.substr(comma + 1); // Skip comma
				} else {
					// ( met before , and ); classy argument
					var p = parseImpl(string);
					args.push(p.ret);
					string = p.rest;
					
					// Expect a comma or rparen (and skip the comma)
					if (string.charAt(0) === ',') {
						string = string.substr(1);
					} else if (string.charAt(0) === ')') {
						break;
					} else {
						throw new ParseError();
					}
				}
			}
			
			if(string.charAt(0) !== ')')
				throw new ParseError();
			
			return {
				args: args,
				rest: string.substr(1)
			};
		}
		
		function parseImpl(string) {
			var c = parseClassName(string);
			var className = c.name;
			string = c.rest;
			
			var a = parseArguments(string);
			var args = a.args;
			string = a.rest;
			
			return {
				className: className,
				args: args,
				ret: [className, args],
				rest: string
			};
		}
		
		function parse(string) {
			try {
				var p = parseImpl(string);
				
				if(p.rest !== '')
					throw new ParseError();
				
				return p.ret;
			} catch(e) {
				return string;
			}
		}
		
		function build(argument) {
			var clsName = argument[0];
			var args = argument[1].map(function(arg) {
                // XXX WTF ?!?!?!
				if(arg instanceof Array)
					return buildArgument(arg);
				
				return translateArgument(arg);
			});
			
			return dataLookup[clsName].apply(null, args);
		}
		
		return function parseConstructArgument(arg) {
			try {
				return build(parse(arg));
			} catch(e) {
				internalError(110, e.message);
			}
		}
	})();

	function translateArgument(argument) {
		if(typeof argument === 'string') {
			var matchData;
	
			matchData = /^r:(\d+)$/.exec(argument);
			if(matchData)
				return dictionary[matchData[1]];
	
			matchData = /^c:(.*?)\((.*?)\)$/.exec(argument);
			if(matchData !== null)
				return parseConstructArgument(argument);
		}
		
		return argument;
	}
	
	var processCommand = {
		'get': function(scope, id, args) {
			addToDictionary(id, scope[args[0]]);
		},
		'set': function(scope, id, args) {
			for(var i=0; i<args.length; i+=2)
				scope[args[i]] = args[i+1];
		},
		'execute': function(scope, id, args) {
			var result = scope[args[0]].apply(scope, args.slice(1));
			
			if(id)
				addToDictionary(id, result);
		},
		'create': function(scope, id, args) {
			var className = args.shift();
			var constructor;

			if(scope) {
				constructor = scope.getConstructor(className);
			} else {
				constructor = classLookup[className];
			}

			if(!constructor)
				internalError(112, "Could not find class with name: " + className);

			addToDictionary(id, dynamicConstruct(constructor, args));
		},
		'destroy': function(scope, id, args) {
			while(args.length) {
				var objectId = args.pop()
				var object = dictionary[objectId];

				if(typeof object.destroy === 'function')
					object.destroy(false);

				delete dictionary[objectId];
			}
		},
		'save': function(scope, id, args) {
			storage.set(args[0], args[1]);
		},
		'doneloading': function() {
			// TODO
		}
	};

	return function flush(commands) {
		if(commands[0] && commands[0][0] === 'load') {
			nextTick(function() {
				// TODO Use #content instead
				var containerElement = document.getElementById('flashContent');

				var inputElement = document.createElement('div');
				inputElement.style.position = 'absolute';
				inputElement.style.top = '0';
				inputElement.style.left = '0';
				inputElement.style.bottom = '0';
				inputElement.style.right = '0';

				var stageElement = inputElement.cloneNode(true);
				stageElement.style.overflow = 'hidden';

				containerElement.appendChild(stageElement);
				containerElement.appendChild(inputElement);

				stage = new Stage();
				addToDictionary(1, stage);
				stage.execute(stageElement, inputElement);

				sp.bridge.genesis(SPACEPORT_VERSION, {
					'flash.display::Stage': {
						'orientation': 'unknown',
						'deviceOrientation': 'unknown',
						'supportedOrientations': [],
						'supportsOrientationChange': false,

						'stageWidth': stageElement.offsetWidth,
						'stageHeight': stageElement.offsetHeight
					},
					'flash.net::SharedObject': storage.getAll()
				});

				gameLoop(stage, buffer, sp.bridge.recieve);
			});
			
			return;
		}
		
		var futureDeps = {};

		commands.forEach(function runCommand(command) {
			var type = command[0];
			var scopeId = command[1] >> 0;
			var id = command[2];
			
			var scope = dictionary[scopeId];
			
				// If you can't find the scope to operate on 
			if(!scope && scopeId !== 0) {
				if(!futureDeps[scopeId])
					futureDeps[scopeId] = [];
			
					// Keep for later
				futureDeps[scopeId].push(command);
			
					// Don't process yet
				return;
			}

			processCommand[type](scope, id, command.slice(3).map(translateArgument));
			
				// Any future deps?
			if(futureDeps[id]) {
					// Execute them in order
				while(futureDeps[id].length)
					runCommand.call(this, futureDeps[id].pop());
			
					// Mem clear
				delete futureDeps[id];
			}
		});

		objectKeys(animatingMovieClips).forEach(function(animateId) {
			// Note that, inside the update method, MovieClips may be destroyed, hence the check.
			var mc = animatingMovieClips[animateId];
			if(mc)
				mc.update();
		});

		var queueItem;

		while((queueItem = queue.shift())) {
			if(typeof queueItem === 'function')
				queueItem();
			else if(queueItem.update)
				queueItem.update();
			else
				internalError(111);
		}

		if(stage) {
			stage.needsRender = true;
		}
	};
});
