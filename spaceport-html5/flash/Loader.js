define('flash/Loader', [
	'flash/DisplayObjectContainer',
	'flash/Shape',
	'util/Matrix',
	'display/Frame',
	'flash/MovieClip',
	'flash/ApplicationDomain',
	'bridge/send',
	'display/svgFills',
	'util/lightClass',
	'dom/xlinkNS',
	'dom/svgNS',
	'dom/jvoNS',
	'flash/TextField',
	'flash/StaticText',
	'flash/BitmapData',
	'flash/Bitmap',
	'shared/internalError',
	'features'
], function(
	DisplayObjectContainer,
	Shape,
	Matrix,
	Frame,
	MovieClip,
	ApplicationDomain,
	send,
	svgFills,
	lightClass,
	xlinkNS,
	svgNS,
	jvoNS,
	TextField,
	StaticText,
	BitmapData,
	Bitmap,
	internalError,
	features
) {
	// Allow at most ten milliseconds of processing before going async
	var CHUNK_THRESHOLD = 10;
	var lastChunkTime = null;
	function shouldChunk() {
		if(lastChunkTime === null) {
			lastChunkTime = Date.now();
		}
		return Date.now() > lastChunkTime + CHUNK_THRESHOLD;
	}

	function chunk(callback, arg) {
		if(shouldChunk()) {
			setTimeout(function() {
				lastChunkTime = Date.now();
				callback(arg);
			}, 0);
			return false;
		} else {
			callback(arg);
			return true;
		}
	}

	function chunkAsync(callback, doneCallback) {
		function next(end /* args... */) {
			if(end) {
				doneCallback.apply(null, Array.prototype.slice.call(arguments, 1));
			} else {
				chunk(callback, next);
			}
		}

		next();
	}

	function chainAsync(callbacks) {
		callbacks = callbacks.slice();

		function next() {
			var callback = callbacks.shift();
			if(callback) {
				setTimeout(function() {
					callback(next);
				}, 0);
			}
		}

		next();
	}

	function forEachChild(parent, callback) {
		var child = parent.firstChild;
		var next;

		while(child) {
			next = child.nextSibling;

			if(child.nodeType === child.ELEMENT_NODE)
				callback(child);

			child = next;
		}
	}

	function chunkForEachChild(parent, nodeCallback, doneCallback) {
		var child = parent.firstChild;
		var nextChild = child;

		chunkAsync(function(next) {
			if(!nextChild) {
				next(true);
				return;
			}

			child = nextChild;
			nextChild = child.nextSibling;
			if(child.nodeType === child.ELEMENT_NODE) {
				nodeCallback(child, next);
			} else {
				next(false);
			}
		}, doneCallback);
	}

	var jvoUniqueId = 0;

	var frameAction = {
		stop: function action_stop() {
			return function stop(mc) {
				mc.stop();
			};
		},
		play: function action_play() {
			return function play(mc) {
				mc.play();
			};
		},
		gotoAndStop: function action_gotoAndStop(frame) {
			return function gotoAndStop(mc) {
				mc.gotoAndStop(frame);
			};
		},
		gotoAndPlay: function action_gotoAndPlay(frame) {
			return function gotoAndPlay(mc) {
				mc.gotoAndPlay(frame);
			};
		}
	};

	function readJVO(jvoDocument, outputDocument, callback) {
		++jvoUniqueId;

		var jvoId = jvoUniqueId;
		var filterId = 0;

		// Unique XML ID prefixes to prevent collisions
		var idPrefix = 'loaded_jvo_' + jvoId + '_';
		var filterIdPrefix = 'loaded_jvo_filter_' + jvoId + '_';

		// http://www.w3.org/TR/xml/#NT-Name
		// TODO This is hacked together (!!! XXX !!!)
		var idRefRe = /#([:A-Z_a-z][:A-Z_a-z.0-9-]*)/;

		var version;
		var root;
		var idLookup = {}; // Element id => node
		var svgDefinitionLibrary = outputDocument.createElementNS(svgNS, 'defs');
		var fillDefinitions = [];
		var filterLookup = {};
		var content;
		var applicationDomain;
		var maskableUses = [];

		function resolveXlinkHref(href) {
			var hashMatch = idRefRe.exec(href);
			if(hashMatch) {
				return idLookup[hashMatch[1]];
			} else {
				return null;
			}
		}

		var filtersRe = /\w*?\(.*?\)/g;
		var filterRe = /^(\w*?)\((.*?)\)$/;

		var filterFactories = {
			col: function (params) {
				var mat = params.split(/\s+/g);

				var node = document.createElementNS(svgNS, 'feColorMatrix');
				node.setAttribute('type', 'matrix');
				node.setAttribute('values', [
					mat[0], 0, 0, 0, mat[4],
					0, mat[1], 0, 0, mat[5],
					0, 0, mat[2], 0, mat[6],
					0, 0, 0, mat[3], mat[7]
				].join(' '));

				return node;
			}
		};

		function makeFilterElement(string) {
			var node = document.createElementNS(svgNS, 'filter');
			node.setAttribute('id', filterIdPrefix + filterId);
			++filterId;

			var filterStrings = string.match(filterRe) || [];
			filterStrings.forEach(function (filterString) {
				var parts = filterRe.exec(filterString);
				if(parts) {
					var factory = filterFactories[parts[1]];
					node.appendChild(factory(parts[2]));
				}
			});

			return node;
		}

		function readJVOFrame(el, sharedInstances, callback) {
			var frameChildren = [];
			var frameChildrenSlots = [];
			var frameActions = [];
			var frameScript = '';
			var frameLabel = el.hasAttribute('label') ? el.getAttribute('label') : null;

			var d = el.getAttribute('d');
			if(d) {
				try {
					d.split(' ').forEach(function(x) {
						var parts = x.split(',');
						var slot = Number(parts[0]);
						var instance = sharedInstances[parts[1]];
						var maskToSlot = Number(parts[2]);

						if(!instance) {
							internalError(220, "Missing shared instance #" + parts[1]);
						}

						if(!isNaN(maskToSlot)) {
							if(features.FILTER_IN_MASK_BUG) {
								// HACK; see frameData loading
								maskableUses.push(instance._element);
							}

							instance = instance.clone();
							instance.maskToSlot = maskToSlot;
						}

						frameChildren.push(instance);
						frameChildrenSlots.push(slot);
					});
				} catch(e) {
					return callback(e);
				}
			}

			chunkForEachChild(el, function(child, next) {
				readJVOInstance(child, function(childInstance) {
					if(childInstance) {
						if(typeof childInstance === 'function') {
							frameActions.push(childInstance);
						} else if(typeof childInstance === 'string') {
							frameScript = childInstance;
						} else {
							var slot = child.getAttributeNS(jvoNS, 'slot') || child.getAttribute('slot');
							frameChildren.push(childInstance);
							frameChildrenSlots.push(slot);
						}
					}

					next();
				});
			}, function() {
				callback(null, new Frame(
					frameChildren,
					frameChildrenSlots,
					frameLabel,
					frameActions,
					frameScript
				));
			});
		}

		function readJVOFrames(parent, callback) {
			var sharedInstances = [];
			var frames = [];
			chunkForEachChild(parent, function(child, next) {
				if(child.namespaceURI !== jvoNS) {
					return next();
				}

				switch(child.localName) {
				case 'frame':
					readJVOFrame(child, sharedInstances, function(err, frame) {
						if(err) return callback(err);

						frames.push(frame);
						return next();
					});
					break;

				case 'frameData':
					chunkForEachChild(child, function(grandchild, next) {
						readJVOInstance(grandchild, function(instance) {
							if(features.FILTER_IN_MASK_BUG) {
								// HACK; see readJVOFrame
								instance._element = grandchild;
							}

							sharedInstances.push(instance);
							return next();
						});
					}, function() {
						return next();
					});
					break;

				default:
					return next();
				}

			}, function() {
				callback(null, frames);
			});
		}

		function readJVOInstanceImpl(el, callback) {
			// FIXME callback should be (err, val) but is (val)

			if(el.namespaceURI === jvoNS) {
				switch(el.localName) {
				case 'class':
					var referenced = resolveXlinkHref(el.getAttributeNS(xlinkNS, 'href'));
					if(!referenced) {
						console.warn('Invalid reference to ' + el.getAttributeNS(xlinkNS, 'href'));
						return null;
					}

					return readJVOInstance(referenced, callback.bind(null, null));

				case 'jvo':
				case 'sprite':
					readJVOFrames(el, function(err, frames) {
						if(err) return callback(err);

						var mc = new MovieClip();
						mc.frames = frames;
						callback(null, mc);
					});
					return;

				case 'frameData':
					// Ignore
					return callback(null, null);

				// Frame actions
				case 'stop':
					return callback(null, frameAction.stop());

				case 'play':
					return callback(null, frameAction.play());

				case 'gotoAndStop':
					return callback(null, frameAction.gotoAndStop(el.getAttribute('frame')));

				case 'js':
					return callback(null, el.textContent);

				case 'gotoAndPlay':
					return callback(null, frameAction.gotoAndPlay(el.getAttribute('frame')));

				case 'mask':
					if(version == 1.0) {
						// Unused
						return callback(null, null);
					}
					// FALL THROUGH to default

				default:
					return callback(new Error("Invalid element " + el.localName));
				}
			}

			if(el.namespaceURI === svgNS) {
				switch(el.localName) {
				case 'class':
				case 'use':
					var referenced = resolveXlinkHref(el.getAttributeNS(xlinkNS, 'href'));
					if(!referenced) {
						return callback(new Error("Invalid reference to " + el.getAttributeNS(xlinkNS, 'href')));
					}

					readJVOInstance(referenced, function(instance) {
						instance = instance.clone();

						var rawTransform = el.getAttribute('transform');
						if(!rawTransform) {
							// JVO 1.0 had a bug where svg: was applied to transform
							rawTransform = el.getAttributeNS(svgNS, 'transform');
						}

						if(rawTransform) {
							var transformMatrix = Matrix.fromSvgTransform(rawTransform);
							instance.transform = transformMatrix.set(null, null, null, null, 0, 0);
							instance.x = transformMatrix.tx;
							instance.y = transformMatrix.ty;
						} else {
							instance.transform = Matrix.identity;
						}

						var filter = el.getAttribute('filter');
						if(filter) {
							instance.displayList.svgFilter = filter;
							instance.displayList.filterAlpha = Number(el.getAttribute('filterAlpha')); // TEMP
						}

						if(referenced.viewBox) {
							var viewBox = referenced.viewBox.baseVal;
							instance.displayList.localX += viewBox.x;
							instance.displayList.localY += viewBox.y;
						}

						if(el.hasAttributeNS(jvoNS, 'className')) {
							instance.className = el.getAttributeNS(jvoNS, 'className');
						}

						if(el.hasAttributeNS(jvoNS, 'name')) {
							instance.name = el.getAttributeNS(jvoNS, 'name');
						}

						if(el.hasAttributeNS(jvoNS, 'maskTo')) {
							instance.maskToSlot = Number(el.getAttributeNS(jvoNS, 'maskTo'));
							if(features.FILTER_IN_MASK_BUG) {
								maskableUses.push(el);
							}
						}

						callback(null, instance);
					});
					return;

				case 'symbol':
					switch(el.getAttributeNS(jvoNS, 'type')) {
					case 'TextField':
						return callback(null, TextField.fromElement(el));
					case 'StaticText':
						return callback(null, StaticText.fromElement(el));
					default:
						return callback(null, Shape.fromElement(el));
					}

				default:
					return callback(new Error("Invalid element " + el.localName));
				}
			}
		}

		// ID => instance mapping
		// Needed because we may reference the same (e.g.) Sprite multiple
		// times and we don't want multiple instances of that sprite.
		var instances = {};

		function readJVOInstance(el, callback) {
			var id = el.getAttribute('id');
			if(id && Object.prototype.hasOwnProperty.call(instances, id)) {
				callback(instances[id]);
				return;
			}

			readJVOInstanceImpl(el, function(err, instance) {
				// TODO
				//if(err) return callback(err);
				if(DEBUG && err) console.error(err);

				if(id && instance) {
					instances[id] = instance;
				}

				callback(instance);
			});
		}

		function readApplicationDomain(root, callback) {
			var appDomain = new ApplicationDomain();

			chunkForEachChild(root, function(child, next) {
				if(child.namespaceURI === jvoNS && child.localName === 'class') {
					var name = child.getAttribute('name');
					readJVOInstance(child, function(value) {
						appDomain.definitions[name] = value;
						next();
					});
				} else {
					next();
				}
			}, function() {
				callback(appDomain);
			});
		}

		chainAsync([
			function init(next) {
				root = jvoDocument.documentElement;

				version = root.getAttribute('version');
				// Fuzzy comparisons
				if(version != 1.0 && version != 3.3) {
					callback(new Error("Invalid JVO version " + version));
				} else {
					next();
				}
			},

			function rewrite(next) {
				function visitNode(node) {
					if(node.hasAttribute('id')) {
						var id = idPrefix + node.getAttribute('id');
						node.setAttribute('id', id);
						idLookup[id] = node;
					}

					if(node.hasAttribute('fill')) {
						var fill = node.getAttribute('fill');
						if(/^url\([^)]+\)$/.test(fill)) {
							node.setAttribute('fill', 'url(#' + idPrefix + idRefRe.exec(fill)[1] + ')');
						}
					}

					if(node.hasAttributeNS(xlinkNS, 'href')) {
						var href = node.getAttributeNS(xlinkNS, 'href');
						if(idRefRe.test(href)) {
							node.setAttributeNS(xlinkNS, 'href', '#' + idPrefix + idRefRe.exec(href)[1]);
						}
					}

					if(node instanceof SVGGradientElement) {
						fillDefinitions.push(node);
					}

					if(node instanceof SVGPatternElement) {
						if(features.IOS_UPSIDE_DOWN_SVG_PATTERN_BUG) {
							node.setAttribute('patternTransform',
								node.getAttribute('patternTransform') +
								' scale(1,-1)'
							);
						}

						fillDefinitions.push(node);
					}

					var filters = node.getAttributeNS(jvoNS, 'filters');
					if(filters) {
						if(!Object.prototype.hasOwnProperty.call(filterLookup, filters)) {
							filterLookup[filters] = makeFilterElement(filters);
						}

						var filterId = filterLookup[filters].getAttribute('id');
						node.setAttributeNS(svgNS, 'filter', 'url(#' + filterId + ')');

						// HACK FIXME TEMP This lets us use the opacity style to
						// simulate alpha colour transforms.
						node.setAttributeNS(svgNS, 'filterAlpha', filterRe.exec(filters)[2].split(/\s+/g)[3]);
					}
				}

				var nsPrefixes = {
					's': svgNS,
					'x': xlinkNS,
					'j': jvoNS
				};

				function nsResolver(prefix) {
					return nsPrefixes[prefix] || null;
				}

				var iter = root.ownerDocument.evaluate(
					'//*[@id] | ' +
					'//*[@fill] | ' +
					'//*[@j:filters] | ' +
					'//s:linearGradient | ' +
					'//s:radialGradient | ' +
					'//s:pattern | ' +
					'//*[@x:href]',
					root, nsResolver, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null
				);

				var queue = [];
				var x;
				while(x = iter.iterateNext()) {
					queue.push(x);
				}

				idLookup[idPrefix + 's0'] = root; // Stage

				function visitChunk() {
					while(queue.length && !shouldChunk()) {
						var node = queue.pop();
						visitNode(node);
					}

					if(queue.length === 0) {
						next();
					} else {
						chunk(visitChunk);
					}
				}

				visitChunk();
			},

			function svgDefinitions(next) {
				chunkForEachChild(root, function(child, next) {
					if(child instanceof SVGDefsElement) {
						chunkForEachChild(child, function(grandChild, next) {
							svgDefinitionLibrary.appendChild(outputDocument.adoptNode(grandChild));
							next();
						}, next);
					} else {
						next();
					}
				}, function() {
					// Remove font-face for Safari
					// FIXME FONTS FONTS FONT FACE MISSING FONTS BLAH!
					var fontFaces = svgDefinitionLibrary.querySelectorAll('font-face');
					for(var i = 0; i < fontFaces.length; ++i) {
						var fontFace = fontFaces[i];
						fontFace.parentNode.removeChild(fontFace);
					}

					next();

					// TODO Add filter elements
				});
			},

			function readContent(next) {
				readJVOInstance(root, function(content_) {
					content = content_;

					content.activate();
					next();
				});
			},

			function readAppDomain(next) {
				readApplicationDomain(root, function(appDomain) {
					applicationDomain = appDomain;
					next();
				});
			},

			function postProcessing(next) {
				if(features.FILTER_IN_MASK_BUG) {
					// All <symbol> nodes of a <use> nodes which are maskable
					// should be cloned with a white fill, because filters are
					// not supported in masking objects.
					var allUses = [];
					var allSymbols = [];

					function handleUse(use) {
						if(allUses.indexOf(use) >= 0) {
							return;
						}
						allUses.push(use);

						var used = resolveXlinkHref(use.getAttributeNS(xlinkNS, 'href'));
						if(!used) {
							internalError(4873);
						}
						if(used instanceof SVGSymbolElement) {
							if(allSymbols.indexOf(used) >= 0) {
								return;
							}

							allSymbols.push(used);
						}

						var subUses = used.querySelectorAll('use');
						for(var i=0; i<subUses.length; ++i) {
							handleUse(subUses[i]);
						}
					}

					maskableUses.forEach(handleUse);

					allSymbols.forEach(function(symbol) {
						symbol = symbol.cloneNode(true);
						symbol.setAttribute('id', symbol.getAttribute('id') + '_white');

						var paths = symbol.querySelectorAll('path');
						for(var i=0; i<paths.length; ++i) {
							paths[i].setAttribute('fill', 'white');
						}

						// TODO Adjust opacity and other shit which may
						// conflict with this technique.

						svgDefinitionLibrary.appendChild(symbol);
					});
				}

				next();
			},

			function done() {
				callback(null, {
					svgDefinitions: svgDefinitionLibrary,
					content: content,
					applicationDomain: applicationDomain,
					fillDefinitions: fillDefinitions
				});
			}
		]);
	}

	var LoaderInfo = lightClass({
		constructor: function LoaderInfo() {
			this.content = null;
		}
	});

	// Lazy loaded upon first load
	var svgDefinitionContainer = null;

	var Loader = lightClass(DisplayObjectContainer, {
		constructor: function Loader() {
			this.contentLoaderInfo = new LoaderInfo();
		},
		'content': {
			get: function get_content() {
				return this.contentLoaderInfo.content;
			}
		},
		'updateContent': function updateContent() {
			// Ugly way to remove all children
			if(this.content)
				this.addChild(this.content);
		},
		'load': function load(request, context) {
			var swfRe = /\.swf$/i;

			if(request.method === 'GET') {
				if(swfRe.test(request.url)) {
					this.loadJVO(request.url.replace(swfRe, '.jvo'));
				} else {
					// Assume an image otherwise
					this.loadImage(request.url);
				}
			} else {
				console.error('Can\'t handle request', request);
			}
		},
		'loadJVO': function loadJVO(uri) {
			var self = this;
			var xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function () {
				if(xhr.readyState === 4) {
					if(xhr.status !== 200 && xhr.status !== 0) {
						send({
							$: 'IOErrorEvent',
							type: 'ioError',
							target: self.contentLoaderInfo.id,
							bubbles: false,
							cancelable: false,
							text: xhr.status + ": " + xhr.statusText
						});
						return;
					}

					var jvo;
					if (xhr.responseXML)
						jvo = xhr.responseXML;
					else
						jvo = (new DOMParser()).parseFromString(xhr.responseText, 'text/xml');

					var startTime = Date.now();
					readJVO(jvo, document, function(err, parsed) {
						var endTime = Date.now();
						if(err) {
							if(DEBUG) {
								throw new Error("Error parsing " + uri + ": " + err);
							} else {
								throw new Error("Error parsing " + uri);
							}
						}

						svgFills.push.apply(svgFills, parsed.fillDefinitions);

						if (!svgDefinitionContainer) {
							svgDefinitionContainer = document.createElementNS(svgNS, 'svg');
							document.body.appendChild(svgDefinitionContainer);
						}
						svgDefinitionContainer.appendChild(parsed.svgDefinitions);

						self.contentLoaderInfo.content = parsed.content;
						self.contentLoaderInfo.applicationDomain = parsed.applicationDomain;
						self.updateContent();

						var descriptor = {
							content: {},
							applicationDomain: {}
						};
						parsed.content.writeDescriptor(descriptor.content);
						parsed.applicationDomain.writeDescriptor(descriptor.applicationDomain);

						send(self.contentLoaderInfo, {
							$: 'Event',
							type: 'complete',
							bubbles: false,
							cancelable: false
						}, descriptor);
					});
				}
			};

			xhr.open('GET', uri);
			xhr.send();
		},
		'loadImage': function loadImage(uri) {
			var self = this;
			var img = document.createElement('img');

			img.onload = function() {
				var bitmapData = new BitmapData(img.width, img.height, true, 0);
				bitmapData.copyPixelsImpl(img);

				var bitmap = new Bitmap(bitmapData);
				bitmap.originX = 0;
				bitmap.originY = 0;

				self.contentLoaderInfo.content = bitmap;
				self.updateContent();

				send(self.contentLoaderInfo, {
					$: 'Event',
					type: 'complete',
					bubbles: false,
					cancelable: false
				}, {
					content: {
						$: 'Bitmap',
						bitmapData: {
							$: 'BitmapData',
							width: bitmapData.width,
							height: bitmapData.height
						}
					}
				});
			};

			// src must be set after onload, as onload can be called
			// immediately (in the event that it was cached, for example)
			img.src = uri;
		}
	});

	return Loader;
});
