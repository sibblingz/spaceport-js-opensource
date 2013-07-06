define('flash/display/Stage', [
	'util/caps/capsOf',
	'proxy/create',
	'flash/display/DisplayObjectContainer',
	'shared/defineGetter',
	'flash/events/StageOrientationEvent',
	'flash/display/StageOrientation',
	'flash/display/StageAspectRatio',
	'flash/display/StageQuality',
	'bridge/silence'
], function(
	capsOf,
	createProxyClass,
	DisplayObjectContainer,
	defineGetter,
	StageOrientationEvent,
	StageOrientation,
	StageAspectRatio,
	StageQuality,
	silence
) {
	var validOrientations = [
		StageOrientation.DEFAULT,
		StageOrientation.ROTATED_RIGHT,
		StageOrientation.ROTATED_LEFT,
		StageOrientation.UPSIDE_DOWN
	];
	
	var validAspectRatios = [
		StageAspectRatio.PORTRAIT,
		StageAspectRatio.LANDSCAPE
	];
	
	var capsOfStage = (function() {
		var caps;
		return function() {
			if(!caps)
				caps = capsOf(Stage);
			
			return caps;
		};
	})();

	var Stage = createProxyClass('Stage', DisplayObjectContainer, {
		properties: {
			'autoOrients': false,
			'color': 0xFFFFFF,
			'frameRate': 30,
			'quality': StageQuality.HIGH
		},
		patch: function patch(target, patch, mutator) {
			var caps = capsOfStage();
			
			mutator.patchObjectProperties(caps, patch, ['stageWidth', 'stageHeight', 'orientation', 'deviceOrientation']);
			
			if(patch.change)
				target.setOrientation(patch.change);
		},
		methods: {
			real: {
				'setOrientation': function setOrientation(newOrientation) {
					if(validOrientations.indexOf(newOrientation) === -1)
						throw new Error('The value passed as the newOrientation parameter is not valid');
					
					var caps = capsOfStage();
					var oldOrientation = caps.orientation;
					
						// Nothing to do here
					if(oldOrientation === newOrientation)
						return;
					
						// Change the orientation before the event fires
					caps.orientation = newOrientation;
					
						// Notice everyone that the orientation changed
					this.dispatchEvent(new StageOrientationEvent(StageOrientationEvent.ORIENTATION_CHANGE, false, false, oldOrientation, newOrientation));
				},
				'setAspectRatio': function setAspectRatio(newAspectRatio) {
					if(validAspectRatios.indexOf(newAspectRatio) === -1)
						throw new Error('The value passed as the newAspectRatio parameter is not valid');
					
					// TODO: this.orientation is now out of sync...
				}
				},
			fake: {
				'deviceOrientation': {
					get: function() {
						return capsOfStage().deviceOrientation;
					}
				},
				'orientation': {
					get: function() {
						return capsOfStage().orientation;
					}
				},
				'root': {
					get: function() {
						return this;
					}
				},
				'stage': {
					get: function() {
						return this;
					}
				},
				'stageWidth': {
					get: function() {
						return capsOfStage().stageWidth;
					}
				},
				'stageHeight': {
					get: function() {
						return capsOfStage().stageHeight;
					}
				},
				'fillScreenWidth': {
					get: function() {
						return capsOfStage().stageWidth;
					}
				},
				'fillScreenHeight': {
					get: function() {
						return capsOfStage().stageHeight;
					}
				},
				'supportedOrientations': {
					get: function() {
						return capsOfStage().supportedOrientations.concat();
					}
				}
			}
		}
	});
	
	defineGetter(Stage, 'supportsOrientationChange', function() {
		return capsOfStage().supportsOrientationChange;
	});
	
	return Stage;
});
