define('gameLoop', [
	'util/nextTick',
	'util/requestAnimFrame'
], function(
	nextTick,
	requestAnimFrame
) {
	return function gameLoop(stage, buffer, receive) {
		function turnRenderLoop() {
			stage.render();
		}

		function turnMainLoop() {
			// The enterFrame event needs to be the first event received by sp, so
			// we handle it specially here.
			buffer.unshift({
				event: { $: 'Event', type: 'enterFrame' }
			});

			// We save the buffer in case Spaceport throws an exception or the
			// browser kills the script.  Note that this line also clears the
			// buffer for the next frame.
			var sendBuffer = buffer.splice(0, buffer.length);
			receive(sendBuffer);
		}

		function nextMain() {
			setTimeout(function() {
				nextMain();

				turnMainLoop();

				if(!requestAnimFrame) {
					turnRenderLoop();
				}
			}, 1000 / stage.frameRate);
		}
		nextMain();

		if(requestAnimFrame) {
			function nextRender() {
				requestAnimFrame(function() {
					nextRender();

					turnRenderLoop();
				}, stage.stageElement);
			}
			nextRender();
		}
	};
});
