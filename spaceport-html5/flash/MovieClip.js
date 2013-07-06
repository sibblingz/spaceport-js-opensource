define('flash/MovieClip', [
	'flash/DisplayObjectContainer',
	'dom/op',
	'display/animatingMovieClips',
	'util/lightClass',
	'shared/internalError',
	'display/MaskDisplayList'
], function(
	DisplayObjectContainer,
	domOp,
	animatingMovieClips,
	lightClass,
	internalError,
	MaskDisplayList
) {
	function frameCheck(functionName) {
		return function () {
			if(this.frames.length > 1)
				throw new Error('MovieClip child manipulation not supported');

			return DisplayObjectContainer.prototype[functionName].apply(this, arguments);
		};
	}

	function destroyInstance(instance) {
		return instance.destroy(true);
	}

	var animateId = 0;

	var DOM_INSERT = domOp.INSERT;
	var DOM_REMOVE = domOp.REMOVE;
	var DOM_REPLACE = domOp.REPLACE;

	var MovieClip = lightClass(DisplayObjectContainer, {
		constructor: function MovieClip() {
			this.frameId = null;
			this.frameDelta = 0;
			this.frames = [];

			this.childSlotNumbers = [];
			this.maskSlotNumbers = [];

			this.animateId = animateId++;

			this.isActive = false;
		},
		'addChild': frameCheck('addChild'),
		'addChildAt': frameCheck('addChildAt'),
		'removeChild': frameCheck('removeChild'),
		'removeChildAt': frameCheck('removeChildAt'),
		'swapChildren': frameCheck('swapChildren'),
		'swapChildrenAt': frameCheck('swapChildrenAt'),
		'setChildIndex': frameCheck('setChildIndex'),
		'activate': function activate() {
			this.isActive = true;
			this.play();

			this.setFrame(this.frameId || 1);
		},
		'nextFrame': function nextFrame() {
			++this.frameId;
		},
		'prevFrame': function prevFrame() {
			--this.frameId;
		},
		'play': function play() {
			if(this.frames.length > 1)
				animatingMovieClips[this.animateId] = this;
			this.frameDelta = 1;
		},
		'stop': function stop() {
			delete animatingMovieClips[this.animateId];
			this.frameDelta = 0;
		},
		'getFrameNumber': function getFrameNumber(frameName) {
			if(!isNaN(Number(frameName)))
				return Number(frameName);

			var frames = this.frames;
			for(var i=0; frames[i]; ++i) {
				if(frames[i].label === frameName) {
					return i + 1;
				}
			}

			internalError(250, "Unknown frame label " + frameName);
		},
		'gotoFrame': function gotoFrame(frame) {
			this.setFrame(this.getFrameNumber(frame));
		},
		'gotoAndPlay': function gotoAndPlay(frame) {
			this.gotoFrame(frame);
			this.play();
		},
		'gotoAndStop': function gotoAndStop(frame) {
			this.gotoFrame(frame);
			this.stop();
		},
		'update': function update() {
			if(this.frameId === null)
				this.setFrame(1);
			else
				this.setFrame(this.frameId + this.frameDelta);
		},
		'currentFrame': {
			get: function get_currentFrame() {
				if(this.frames.length === 0)
					return null;
				else
					return this.frames[this.frameId - 1];
			}
		},
		'setFrame': function setFrame(frameId) {
			if(frameId === null)
				return;

			if(!this.frames.length) {
				if(DEBUG) {
					throw new Error("MovieClip has no frames!");
				} else {
					return;
				}
			}

			var effectiveFrameId = (frameId - 1) % this.frames.length + 1;
			while(effectiveFrameId <= 0)
				effectiveFrameId += this.frames.length;

			if(this.frameId !== effectiveFrameId) {
				this.frameId = effectiveFrameId;

				if(!this.isActive)
					return;

				var frame = this.currentFrame;

				frame.actions.forEach(function(frameAction) {
					frameAction(this);
				}, this);

				// Frame changes by action should cancel setting this frame
				if(this.frameId !== effectiveFrameId)
					return;

				var frameChildren = frame.children;
				var childSlotNumbers = this.childSlotNumbers;
				var children = this.children;

				var child;
				var i = 0, j = 0;
				while(j < frame.childSlotNumbers.length) {
					var thisSlot = childSlotNumbers[i];
					var frameSlot = frame.childSlotNumbers[j];
					if(i >= childSlotNumbers.length) {
						// New child added at end
						child = frameChildren[j].clone();
						child.parentObject = this;
						child.activate();

						childSlotNumbers.splice(i, 0, frameSlot);
						children.splice(i, 0, child);

						this.displayList.children.splice(i, 0, child.displayList);
						this.displayList.domEdits.push([DOM_INSERT, i]);

						++i;
						++j;
					} else if(thisSlot > frameSlot) {
						// New child added
						child = frameChildren[j].clone();
						child.parentObject = this;
						child.activate();

						childSlotNumbers.splice(i, 0, frameSlot);
						children.splice(i, 0, child);

						this.displayList.children.splice(i, 0, child.displayList);
						this.displayList.domEdits.push([DOM_INSERT, i]);
					} else if(thisSlot < frameSlot) {
						// Existing child removed
						childSlotNumbers.splice(i, 1);
						var removed = children.splice(i, 1);
						this.displayList.children.splice(i, 1);

						removed.parentObject = null;
						removed.forEach(destroyInstance);

						this.displayList.domEdits.push([DOM_REMOVE, i]);
					} else if(thisSlot === frameSlot) {
						// Same frame
						if(children[i].isTemplateShared(frameChildren[j])) {
							// Same object; copy effects
							frameChildren[j].displayList.copyEffectsTo(children[i].displayList);
						} else {
							// Different object; recreate
							child = frameChildren[j].clone();
							child.parentObject = this;
							child.activate();

							var removed = children.splice(i, 1, child);
							this.displayList.children.splice(i, 1, child.displayList);

							removed.forEach(destroyInstance);
							removed.parentObject = null;

							this.displayList.domEdits.push([DOM_REPLACE, i]);
						}

						++i;
						++j;
					}
				}

				// Remove extra children
				var extraCount = childSlotNumbers.length - frame.childSlotNumbers.length;
				childSlotNumbers.splice(j, extraCount);
				var removed = children.splice(j, extraCount);
				this.displayList.children.splice(j, extraCount);
				removed.forEach(destroyInstance);

				// Resolve mask slots
				for(i = 0; i < children.length; ++i) {
					var child = children[i];
					if(child.maskToSlot) {
						var maskCount = 0;
						for(j = i + 1;
						    j < childSlotNumbers.length && childSlotNumbers[j] < child.maskToSlot;
						    ++j) {
							++maskCount;
						}

						child.displayList.maskCount = maskCount;
					}
				}
			}
		},

		'writeDescriptor': function writeDescriptor(object) {
			DisplayObjectContainer.prototype.writeDescriptor.call(this, object);
			object.$ = 'MovieClip';

			var labels = {};
			var hasLabels = false;

			var scripts = {};
			var hasScripts = false;

			this.frames.forEach(function(frame, i) {
				if(frame.label) {
					labels[frame.label] = i + 1;
					hasLabels = true;
				}

				if(frame.script) {
					scripts[i + 1] = frame.script;
					hasScripts = true;
				}
			});

			if(!this.isActive && this.frames.length > 0) {
				var childrenDescriptors = this.frames[0].children.map(function(child) {
					var childDescriptor = {};
					child.writeDescriptor(childDescriptor);
					return childDescriptor;
				});

				if(childrenDescriptors.length)
					object.children = childrenDescriptors;
			}

			if(hasLabels)
				object.labels = labels;
			if(hasScripts)
				object.scripts = scripts;

			object.totalFrames = this.frames.length;
		},
		'cloneInto': function cloneInto(object) {
			DisplayObjectContainer.prototype.cloneInto.call(this, object);

			object.childSlotNumbers = this.childSlotNumbers.slice();
			object.frames = this.frames.slice();
			object.setFrame(this.frameId);
		},
		'clone': function clone() {
			var cloned = new MovieClip();
			this.cloneInto(cloned);
			this.displayList.copyEffectsTo(cloned.displayList);
			return cloned;
		},
		'destroy': function destroy(deep) {
			DisplayObjectContainer.prototype.destroy.call(this, deep);

			this.stop();
		}
	});

	return MovieClip;
});
