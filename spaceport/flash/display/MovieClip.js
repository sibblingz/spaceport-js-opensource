define('flash/display/MovieClip', [
	'proxy/create',
	'flash/events/Event',
	'flash/display/Sprite',
	'flash/display/FrameLabel',
	'util/builtin/isNaN',
	'util/broadcast/addListener',
	'shared/defineReadOnly',
	'shared/defineGetter',
	'bridge/silence',
	'shared/hasProperty',
	'util/builtin/slice',
	'spid',
	'shared/internalError',
	'shared/objectKeys',
	'util/js/safeUserCall',
	'avm/compile'
], function(
	createProxyClass,
	Event,
	Sprite,
	FrameLabel,
	isNaN,
	addBroadcastListener,
	defineReadOnly,
	defineGetter,
	silence,
	hasProperty,
	slice,
	SPID,
	internalError,
	objectKeys,
	safeUserCall,
	avmCompile
) {
	// XXX THIS IS YOUR BIBLE!
	// http://www.senocular.com/flash/tutorials/orderofoperations/

		// currentFrame trackers
	var frameCounter = 0;
	var framePositions = {};
	
	// Frame actions per MovieClip are stored as a circular linked list.  This
	// makes it easy to, after processing a frame action, queue the next frame
	// action.
	// frameActions is a mapping of MovieClip ID => nextFrameNode
	var frameActions = {};

	// Frame actions are queued by calculating when the next frame action per
	// MovieClip will activate (assuming the playhead of the MovieClip is not
	// changed, e.g. with stop()).
	// scheduledActions is a map of globalFrameNumber => [MovieClips]
	var scheduledActions = {};
	
	// Global handler for advancing MovieClip playback and frameAction
	// bridge.nextFrame depends on this being an object literal.
	addBroadcastListener(Event.ENTER_FRAME, {
		dispatchEvent: function globalFrameIncrease() {
			frameCounter += 1;

			initializeAllMovieClips();

			var actions = scheduledActions[frameCounter];
			if(actions) {
				// Execute frame actions
				actions.forEach(function(mc) {
					// FIXME Order of operations
					var frameNode = frameActions[mc[SPID]];
					if(CUSTOMER_DEBUG && !frameNode) {
						internalError(9005);
					}
					if(CUSTOMER_DEBUG && frameNode.frameNumber !== mc.currentFrame - 1) {
						internalError(9009);
					}
					var nextFrameNode = frameNode.next;

					delete frameActions[mc[SPID]];
					scheduleNode(mc, nextFrameNode);

					safeUserCall(
						frameNode.fn, // fn
						null // thisp
					);
				});

				delete scheduledActions[frameCounter];
			}
		}
	});

	// Frame scripts are represented as a circular linked list of objects.
	//
	// {
	//     frameNumber: Number,
	//     fn: Function,
	//     next: FrameNode
	// }
	//
	// This will later be optimized into a circular linked list of arrays.

	// Finds the FrameScript which has a frame number before or equal to
	// `frameNumber`.  `node` seeds the linked list.
	// FIXME Better name or refactor it to not return equal frame numbers
	function findFrameNodeBeforeFrameNumber(node, frameNumber, totalFrames) {
		while(true) {
			if(node.next.frameNumber <= node.frameNumber) {
				if(node.frameNumber <= frameNumber || frameNumber < node.next.frameNumber) {
					return node;
				}
			} else if(node.frameNumber <= frameNumber && frameNumber < node.next.frameNumber) {
				return node;
			}

			node = node.next;
		}

		internalError(9004);
	}

	function getScheduledNode(node, frameNumber) {
		var n = findFrameNodeBeforeFrameNumber(node, frameNumber);
		return n.next;
	}

	function getScheduledFrameCounter(mc, node) {
		var framesUntilNode = ((node.frameNumber - (mc.currentFrame - 1)) + mc.totalFrames) % mc.totalFrames;
		if(framesUntilNode === 0) {
			framesUntilNode = mc.totalFrames;
		}
		return frameCounter + framesUntilNode;
	}

	function scheduleNode(mc, node) {
		var scheduledFrameCounter = getScheduledFrameCounter(mc, node);
		scheduleNodeAt(mc, node, scheduledFrameCounter);
	}

	function scheduleNodeAt(mc, node, counter) {
		var sa = scheduledActions[counter];
		if(sa) {
			if(sa.indexOf(mc) >= 0) {
				internalError(9008);
			}

			sa.push(mc);
		} else {
			scheduledActions[counter] = [mc];
		}

		frameActions[mc[SPID]] = node;
	}

	function unscheduleNode(mc, node) {
		if(CUSTOMER_DEBUG && (!mc || !node)) {
			internalError(9007);
		}

		var scheduledFrameCounter = getScheduledFrameCounter(mc, node);
		var actions = scheduledActions[scheduledFrameCounter];
		if(!actions) {
			return;
		}

		var idx = actions.indexOf(mc);
		if(idx < 0) {
			return;
		}

		actions.splice(idx, 1);

		if(!actions.length) {
			delete scheduledActions[scheduledFrameCounter];
		}
	}

	function unschedule(mc) {
		var node = frameActions[mc[SPID]];
		if(node) {
			unscheduleNode(mc, node);
		}
	}

	function readjustNodeScheduling(mc, node) {
		var id = mc[SPID];

		var currentlyScheduledNode = frameActions[id];
		if(currentlyScheduledNode) {
			unscheduleNode(mc, currentlyScheduledNode);
		}

		if(node) {
			if(mc.isPlaying) {
				var nodeToSchedule = getScheduledNode(node, mc.currentFrame - 1);
				if(nodeToSchedule) {
					scheduleNode(mc, nodeToSchedule);
				}
			} else if(!currentlyScheduledNode) {
				// Adding a frame action to a non-playing MovieClip
				frameActions[id] = node;
			} else {
				// Do nothing
			}
		} else {
			delete frameActions[id];
		}
	}

	function readjustScheduling(mc) {
		readjustNodeScheduling(mc, frameActions[mc[SPID]]);
	}

	function getPreviousFrameNode(node) {
		var n = node;
		while(n.next !== node) {
			n = n.next;
		}
		return n;
	}

	function removeFrameNode(node) {
		var prev = getPreviousFrameNode(node);
		if(prev.next === prev) {
			return null;
		} else {
			prev.next = node.next;
			return prev;
		}
	}

	function removeFrameScript(node, frameNumber) {
		if(!node) {
			return null;
		}

		var nodeBefore = findFrameNodeBeforeFrameNumber(node, frameNumber);

		if(nodeBefore.frameNumber === frameNumber) {
			return removeFrameNode(nodeBefore);
		} else {
			return node;
		}
	}

	function insertFrameScript(node, frameNumber, fn) {
		if(!node) {
			var n = {
				frameNumber: frameNumber,
				fn: fn
			};
			n.next = n;
			return n;
		}

		// Find where to insert the frame script
		var nodeBefore = findFrameNodeBeforeFrameNumber(node, frameNumber);

		if(nodeBefore.frameNumber === frameNumber) {
			// Replace the frame function
			nodeBefore.fn = fn;
			return nodeBefore;
		} else {
			// Insert a new node after `nodeBefore`
			var newNode = {
				frameNumber: frameNumber,
				fn: fn,
				next: nodeBefore.next
			};
			nodeBefore.next = newNode;

			return newNode;
		}
	}

	function getFrameNumber(mc, frame) {
		var frameInt = parseInt(frame, 10);

		if(!isNaN(frameInt)) {
			return frameInt;
		}

		// Frame is a label
		frame = String(frame);
		var labels = mc.currentLabels;
		for(var i = 0; i < labels.length; ++i) {
			var label = labels[i];
			if(label.name === frame) {
				return label.frame;
			}
		}

		throw new Error('Frame label ' + frame + ' not found');
	}

	function readOnlyTrue() {
		return true;
	}

	function readOnlyFalse() {
		return false;
	}

	// The set of all uninitialized MovieClip instances.  Keyed
	// by ID, valued 'true'.  An 'uninitialized' MovieClip
	// means:
	//
	// * The MC has only one frame,
	// * The MC has not had 'gotoAndStop' or 'gotoAndPlay'
	//   called on it, and
	// * ENTER_FRAME has not occurred since the MC was created.
	//
	// This means the MC's first frame script has not been
	// called.
	//
	// If 'gotoAndStop' or 'gotoAndPlay' is called on an
	// uninitialized MC, or ENTER_FRAME happens, the frame
	// script on the first frame (index 0) is called, and the MC
	// is marked as initialized.  This means the frame script
	// for a one-frame MC is called only once in its lifetime.
	var uninitializedMovieClips = {};

	function initializeMovieClip(mc) {
		if(mc.totalFrames !== 1) {
			return;
		}

		var id = mc[SPID];
		if(!uninitializedMovieClips[id]) {
			return;
		}
		delete uninitializedMovieClips[id];

		justInitializeMovieClip(id);
	}

	function justInitializeMovieClip(id) {
		var frameNode = frameActions[id];
		if(frameNode) {
			safeUserCall(
				frameNode.fn, // fn
				null // thisp
			);
		}
	}

	function initializeAllMovieClips() {
		var ids = Object.keys(uninitializedMovieClips);
		uninitializedMovieClips = {};
		ids.forEach(justInitializeMovieClip);
	}

	function markMovieClipAsInitialized(mc) {
		delete uninitializedMovieClips[mc[SPID]];
	}

	/** A sprite which may contain animation information.
	 *
	 * A MovieClip (called a "symbol" in the Flash IDE) is an animated sprite
	 * loaded from SWF artwork.  Children of a MovieClip are animated
	 * behind-the-scenes by the Spaceport renderer.
	 *
	 * SWF animations are frame-based.  For an object to smoothly transition
	 * between locations, frames between the start and end frame contain a
	 * *tween* which interpolate that object's transformation matrix.
	 *
	 * For more information on loading a SWF, see :attr:`sp.Loader`.
	 *
	 * The MovieClip API allows you to programmatically manipulate the
	 * currently-rendererd frame using the following methods:
	 *
	 *  * :func:`~sp.MovieClip.gotoAndPlay`
	 *  * :func:`~sp.MovieClip.gotoAndStop`
	 *  * :func:`~sp.MovieClip.play`
	 *  * :func:`~sp.MovieClip.stop`
	 *  * :func:`~sp.MovieClip.nextFrame`
	 *  * :func:`~sp.MovieClip.prevFrame`
	 *
	 * .. warning::
	 *
	 *    While an animation is executing, the :attr:`sp.MovieClip.children` of
	 *    a MovieClip are **not** updated to reflect their on-screen
	 *    representation.  If an object is removed from the display heirarchy by
	 *    the renderer, it can no longer be manipulated.  Be careful when
	 *    manipulating the children of an animating MovieClip.
	 *
	 * .. warning::
	 *
	 *    If a MovieClip contains frame actions (using the Flash IDE), the
	 *    JavaScript representation *may* not reflect what is shown on-screen.
	 *    If a MovieClip uses frame actions, be careful when manipulating
	 *    children or accessing :attr:`sp.MovieClip.currentFrame`,
	 *    :attr:`sp.MovieClip.currentLabel`, or :attr:`sp.MovieClip.isPlaying`.
	 */
	var MovieClip = createProxyClass('MovieClip', Sprite, {
		constructor: function MovieClip() {
			var id = this[SPID];
			uninitializedMovieClips[id] = true;
			framePositions[id] = frameCounter;
		},
		patch: function patch(target, patch, mutator) {
			if(patch.labels) {
				var labels = [];
				for(var label in patch.labels)
					labels.push(new FrameLabel(label, patch.labels[label]));

					// Sort labels by frame
				labels = labels.sort(function(a, b) {
					return a.frame - b.frame;
				});

				defineGetter(target, 'currentLabels', function get_currentLabels() {
					return labels.concat();
				});
			}

			if(patch.totalFrames) {
				defineGetter(target, 'isPlaying', readOnlyTrue);
				defineReadOnly(target, 'totalFrames', patch.totalFrames);
				if(target.totalFrames > 1) {
					markMovieClipAsInitialized(target);
				}
			}

			// Depends on totalFrames and isPlaying being patched
			// XXX MUST BE LAST XXX
			if(patch.scripts) {
				objectKeys(patch.scripts).forEach(function(frameNumber) {
					var fnText = patch.scripts[frameNumber];
					var compiled = avmCompile(fnText);
					target.addFrameScript(frameNumber - 1, function() {
						compiled.call(target);
					});
				});

				// We have to special-case the first frame for two reasons:
				//
				// One, the first frame action is always executed, even for
				// single-frame animations.  (For single-frame animations, it is
				// executed only once.)
				//
				// Two, due to how addFrameScript works, the *next* frame script
				// is scheduled if there is a frame script on the first frame.
				// We want this frame script to be executed immediately.
				if(patch.scripts[1]) {
					var id = target[SPID];
					var node = frameActions[id];
					if(CUSTOMER_DEBUG) {
						if(!node) {
							internalError(9010);
						}
					}

					var scheduledNode = frameActions[id];
					if(scheduledNode) {
						unscheduleNode(target, scheduledNode);
					}

					// Find the node at frame number 1 (index 0)
					var firstNode = node;
					if(firstNode.frameNumber !== 0) {
						firstNode = getPreviousFrameNode(firstNode);

						if(firstNode.frameNumber !== 0) {
							if(CUSTOMER_DEBUG) {
								internalError(9011);
							} else {
								// Derp; whatever.  Just ignore.
								return;
							}
						}
					}

					scheduleNode(target, scheduledNode);

					// FIXME These should be *queued* for proper ordering,
					// not executed immediately!
					try {
						firstNode.fn.call(target);
					} catch(e) {
						// DO NOTHING
						// FIXME
						// :(
					}
				}
			}

			// XXX Don't stick anything here.  Scripts must come last.
		},
		methods: {
			real: {
				/** Advances the animation by one frame then stops the animation.
				 *
				 * This method is effectively the same as::
				 *
				 *    var frame = Math.min(mc.currentFrame + 1, mc.totalFrames);
				 *    mc.gotoAndStop(frame);
				 *
				 * That is, the playhead is moved to the next frame then
				 * stopped.  If there is no next frame, the playhead stays at
				 * the last frame.
				 */
				'nextFrame': function nextFrame() {
					silence(function() {
						this.gotoAndStop(Math.min(this.currentFrame + 1, this.totalFrames));
					}, this);
				},
				'prevFrame': function prevFrame() {
					silence(function() {
						this.gotoAndStop(Math.max(this.currentFrame - 1, this.totalFrames));
					}, this);
				},
				/** Starts playing the animation from the current frame.
				 *
				 * This method starts the playhead in its current position.  If
				 * the MovieClip is already animating, this method has no
				 * effect.
				 *
				 * :attr:`sp.MovieClip.isPlaying` will equal ``true`` after
				 * calling this method if the MovieClip can animate.
				 */
				'play': function play() {
					if(this.isPlaying || this.totalFrames == 1)
						return;
					
					framePositions[this[SPID]] = frameCounter - (this.currentFrame - 1);
					defineGetter(this, 'isPlaying', readOnlyTrue);

					readjustScheduling(this);
				},
				/** Stops the animation at the current frame.
				 *
				 * This method stops the playhead in its current position.  If
				 * the MovieClip is not animating, this method has no effect.
				 *
				 * :attr:`sp.MovieClip.isPlaying` will equal ``false`` after
				 * calling this method if the MovieClip can animate.
				 */
				'stop': function stop() {
					if(!this.isPlaying || this.totalFrames == 1)
						return;
					
					unschedule(this);

					framePositions[this[SPID]] = this.currentFrame;
					defineGetter(this, 'isPlaying', readOnlyFalse);
				},
				/** Starts playing the animation from the specified frame.
				 *
				 * This method moves the playhead to the specified frame number
				 * or frame label and plays forward.
				 *
				 * .. seealso:: :func:`~sp.MovieClip.play`
				 *              :func:`~sp.MovieClip.gotoAndStop`
				 *
				 * .. note::
				 *
				 *    Unlike the corresponding ActionScript method, this does
				 *    not take an optional "scene" argument as the second
				 *    parameter.  There is no concept of "scene" in Spaceport
				 *    MovieClips.
				 */
				'gotoAndPlay': function gotoAndPlay(frame) {
					if(this.totalFrames == 1) {
						initializeMovieClip(this);
						return;
					}
					
					var frameInt = getFrameNumber(this, frame);

					unschedule(this);

					framePositions[this[SPID]] = frameCounter - (frameInt - 1);
					defineGetter(this, 'isPlaying', readOnlyTrue);

					readjustScheduling(this);
				},
				/** Stops the animation at the specified frame.
				 *
				 * This method movies the playhead to the specified frame number
				 * or frame label and stops the animation.
				 *
				 * .. seealso:: :func:`~sp.MovieClip.stop`
				 */
				'gotoAndStop': function gotoAndStop(frame) {
					if(this.totalFrames == 1) {
						initializeMovieClip(this);
						return;
					}
					
					var frameInt = getFrameNumber(this, frame);
					
					unschedule(this);

					framePositions[this[SPID]] = frameInt;
					defineGetter(this, 'isPlaying', readOnlyFalse);
				}
			},
			fake: {
				/** Gets the total number of frames in this animation.
				 *
				 * When creating a MovieClip from code, the MovieClip will not
				 * contain animations, and ``totalFrames`` will equal 1.
				 */
				'totalFrames': {
					get: function() {
						return 1;
					}
				},
				/** Gets the current frame.
				 *
				 * .. note::
				 *
				 *    The value of ``currentFrame`` may not reflect what is
				 *    visible on the screen if ``currentlyFrame`` has changed
				 *    since the last :attr:`~sp.Event.ENTER_FRAME` event.
				 */
				'currentFrame': {
					get: function() {
						if(!this.isPlaying)
							return framePositions[this[SPID]];

						return 1 + ((frameCounter - framePositions[this[SPID]]) % this.totalFrames);
					}
				},
				/** Gets the label of the current frame, if any.
				 *
				 * If the current frame has no label, currentLabel is null.
				 *
				 * There is a known issue, where currentFrameLabel will not give
				 * the correct result if the asset contains frame actions such
				 * as :func:`~sp.MovieClip.stop()`, or
				 * :func:`~sp.MovieClip.gotoAndPlay()`.  Frame actions like
				 * these will cause the artwork being rendered and the Spaceport
				 * code to become out of sync.
				 */
				'currentFrameLabel': {
					get: function() {
						var frame = this.currentFrame;
						var labels = this.currentLabels;
						
						if(!labels.length || labels[0].frame > frame)
							return null;
						
						for(var i=0; i<labels.length; ++i) {
							if(labels[i].frame === frame)
								return labels[i].name;
						}
						
						return null;
					}
				},
				
				/** Gets the last label of the current frame, if any.
				 *
				 * :returns:
				 *    The frame label name, or ``null`` if no frame label was
				 *    found.
				 *
				 * If the current frame does not have a label, the previous
				 * frame is checked until a frame label is found or until all
				 * previous frame labels have been checked.
				 *
				 * There is a known issue, where currentLabel will not give the
				 * correct result if the asset contains frame actions such as
				 * :func:`~sp.MovieClip.stop()`, or
				 * :func:`~sp.MovieClip.gotoAndPlay()`.  Frame actions like
				 * these will cause the artwork being rendered and the Spaceport
				 * code to become out of sync.
				 */
				'currentLabel': {
					get: function() {
						var frame = this.currentFrame;
						var labels = this.currentLabels;
						
						if(!labels.length || labels[0].frame > frame)
							return null;
						
						for(var i=labels.length-1; i>=0; --i) {
							if(labels[i].frame <= frame)
								return labels[i].name;
						}
						
						return null;
					}
				},
				'currentLabels': {
					get: function() {
						return [];
					}
				},
				/** Whether or not the MovieClip is animating.
				 *
				 * .. note::
				 *
				 *    If an animation has only one frame, it will not be
				 *    considered playing
				 */
				'isPlaying': {
					get: function() {
						return false;
					}
				},
				'addFrameScript': function addFrameScript() {
						// Need an even number of arguments
					if(arguments.length % 2 !== 0)
						throw new TypeError("Incorrect number of arguments");
					
					var node = frameActions[this[SPID]];
					var totalFrames = this.totalFrames;
					for(var i=0; i<arguments.length; i += 2) {
						var frameNumber = arguments[i] >> 0; // Coerce to number
						if(frameNumber < 0 || frameNumber >= totalFrames)
							continue;

						var fn = arguments[i + 1];
						if(fn) {
							// Add or replace
							node = insertFrameScript(node, frameNumber, fn);
						} else {
							// Remove
							node = removeFrameScript(node, frameNumber);
						}
					}

					readjustNodeScheduling(this, node);
				 },
				'destroy': function destroy(deep) {
					Sprite.prototype.destroy.call(this, deep);
 
					// Be careful of order here!
					var node = frameActions[this[SPID]];
					if(node) {
						unscheduleNode(this, node);
						delete frameActions[this[SPID]];
					}

					delete framePositions[this[SPID]];
				}
			}
		}
	});

	if(DEBUG) {
		// Methods for unit tests
		var mcProto = MovieClip.prototype;

		mcProto.insertFrameScript = function mc_insertFrameScript(frameNumber, fn) {
			var n = insertFrameScript(frameActions[this[SPID]], frameNumber, fn);
			readjustNodeScheduling(this, n);
			return n;
		};

		mcProto.removeFrameScript = function mc_removeFrameScript(frameNumber) {
			var n = removeFrameScript(frameActions[this[SPID]], frameNumber);
			readjustNodeScheduling(this, n);
			return n;
		};

		mcProto.getScheduledFrameNode = function mc_getScheduledFrameNode() {
			return frameActions[this[SPID]] || null;
		};

		mcProto.markAsInitialized = function mc_markAsInitialized() {
			markMovieClipAsInitialized(this);
		};
	}

	return MovieClip;
});
