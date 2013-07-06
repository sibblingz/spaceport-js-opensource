define('flash/Stage', [
	'flash/DisplayObjectContainer',
	'display/StageDisplayList',
	'dom/attach',
	'features',
	'bridge/send',
	'util/lightClass',
	'shared/internalError',
	'pendingSoundCalls'
], function(
	DisplayObjectContainer,
	StageDisplayList,
	attach,
	features,
	send,
	lightClass,
	internalError,
	pendingSoundCalls
) {
	function zeroPad(number, length) {
		return ('' + 1e20 + number).slice(-length);
	}

	var Stage = lightClass(DisplayObjectContainer, {
		constructor: function Stage() {
			this.frameRate = 30;
			this.needsRender = true;
		},
		'execute': function execute(stageElement, inputElement) {
			this.stageElement = stageElement;
			this.displayList = new StageDisplayList(stageElement);

			var self = this;

			this.bgColor = 0xFFFFFF; // white

			function mouseEvent(pageX, pageY, callback) {
				var hit = self.hitTest(
					pageX - inputElement.offsetLeft,
					pageY - inputElement.offsetTop
				);

				while(hit && typeof hit.id === 'undefined') {
					hit = hit.parentObject;
				}

				if(!hit) {
					internalError(240, "Hit testing failed");
				}

				callback(hit, pageX, pageY);
			}

			function playPendingSounds() {
				while (pendingSoundCalls.length) {
					var callback = pendingSoundCalls.shift();
					callback();
				}
			}

			function attachMouseEvent(domName, spName) {
				inputElement.addEventListener(domName, function(event) {
					mouseEvent(event.pageX, event.pageY, function(hit, stageX, stageY) {
						send(hit, {
							$: 'MouseEvent',
							type: spName,
							bubbles: true,
							cancelable: false,
							stageX: stageX,
							stageY: stageY
						});
					});

					event.preventDefault();
					event.stopPropagation();
				}, false);
			}

			function attachTouchEvent(domName, spName) {
				inputElement.addEventListener(domName, function(event) {
					if(event.changedTouches.length) {
						for(var i=0; i<event.changedTouches.length; ++i) {
							var ev = event.changedTouches[i];
							mouseEvent(ev.pageX, ev.pageY, function(hit, stageX, stageY) {
								send(hit, {
									$: 'TouchEvent',
									type: spName,
									bubbles: true,
									cancelable: false,
									stageX: stageX,
									stageY: stageY,
									touchPointID: ev.identifier
								});
							});
						}
					}

					event.preventDefault();
					event.stopPropagation();
				}, false);
			}

			function attachKeyboardEvent(domName, spName) {
				document.addEventListener(domName, function(event) {
					if (event.repeat || event.metaKey || event.altKey || event.ctrlKey)
						return;

					send(self, {
						$: 'KeyboardEvent',
						type: spName,
						bubbles: true,
						cancelable: false,
						keyCode: event.keyCode,
						charCode: event.charCode
					});

					event.preventDefault();
					event.stopPropagation();
				}, false);
			}

			var mouseDownCount = 0;
			attach([ window, inputElement ], 'mousedown', function(event) {
				if(!event.mouseCountHandled) {
					event.mouseCountHandled = true;
					++mouseDownCount;
				}
			});
			attach([ window, inputElement ], 'mouseup', function(event) {
				if(!event.mouseCountHandled) {
					event.mouseCountHandled = true;
					--mouseDownCount;
				}
			});

			attachMouseEvent('mousedown', 'mouseDown');
			attachMouseEvent('mouseup', 'mouseUp');
			attachMouseEvent('click', 'click');

			attach(inputElement, 'mousemove', function(event) {
				if(!mouseDownCount) {
					// Don't send mouse events when no button is pressed
					event.stopPropagation();
					return;
				}

				mouseEvent(event.pageX, event.pageY, function(hit, stageX, stageY) {
					send(hit, {
						$: 'MouseEvent',
						type: 'mouseMove',
						bubbles: true,
						cancelable: false,
						stageX: stageX,
						stageY: stageY
					});
				});

				event.preventDefault();
				event.stopPropagation();
			});

			attachTouchEvent('touchstart', 'touchBegin');
			attachTouchEvent('touchmove', 'touchMove');
			attachTouchEvent('touchend', 'touchEnd');

			attachKeyboardEvent('keydown', 'keyDown');
			attachKeyboardEvent('keyup', 'keyUp');

			var stageWidth = stageElement.offsetWidth;
			var stageHeight = stageElement.offsetHeight;
			function checkResize() {
				var newStageWidth = stageElement.offsetWidth;
				var newStageHeight = stageElement.offsetHeight;

				if(stageWidth !== newStageWidth || stageHeight !== newStageHeight) {
					stageWidth = newStageWidth;
					stageHeight = newStageHeight;

					send(self, {
						$: 'Event',
						type: 'resize',
						bubbles: true,
						cancelable: false
					}, {
						width: stageWidth,
						height: stageHeight
					});
				}
			}

			attach(window, 'resize', function(event) {
				checkResize();
			});

			if (features.IOS_NO_SOUND_BUG) {
				[
					'mouseup', 'mousedown', 'mousemove', 'click',
					'touchstart', 'touchend', 'touchmove',
					'keydown', 'keyup'
				].forEach(function(eventName) {
					attach([ window, inputElement ], eventName, playPendingSounds);
				});
			}

			setInterval(checkResize, 500);
		},
		'color': {
			set: function set_color(color) {
				color = Math.min(color >>> 0, 0xFFFFFF);
				var colorString = zeroPad(color.toString(16), 6);
				this.stageElement.style.backgroundColor = '#' + colorString;
			}
		},
		'hitTest': function hitTest(x, y) {
			var hit = DisplayObjectContainer.prototype.hitTest.call(this, x, y);
			return hit || this;
		},
		'render': function render() {
			if (this.needsRender) {
				this.needsRender = false;
				this.displayList.buildIntoElement(this.stageElement, false /* isMasking */);
			}
		}
	});

	return Stage;
});
