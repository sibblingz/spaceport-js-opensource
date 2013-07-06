define('flash/media/SoundChannel', [
	'proxy/create',
	'flash/events/EventDispatcher',
	'bridge/silence',
	'flash/media/SoundTransform',
	'spid',
	'shared/hasProperty'
], function(
	createProxyClass,
	EventDispatcher,
	silence,
	SoundTransform,
	SPID,
	hasProperty
) {
	var soundTransforms = {};
	var soundPositions = {};

	function cloneSoundTransform(st) {
		return new SoundTransform(
			st.volume,
			st.panning
		);
	}

	return createProxyClass('SoundChannel', EventDispatcher, {
		properties: {
			'soundTransform': {
				get: function get_soundTransform() {
					var soundTransform = soundTransforms[this[SPID]];
					if(soundTransform)
						return cloneSoundTransform(soundTransform);

					return new SoundTransform();
				},
				set: function set_soundTransform(value) {
					if(value == null)
						delete soundTransforms[this[SPID]];
					else
						soundTransforms[this[SPID]] = cloneSoundTransform(SoundTransform(value));
				}
			}
		},
		methods: {
			real: {
				'stop': function() {
					silence(this.destroy, this);
				},
				'destroy': function() {
					EventDispatcher.prototype.destroy.call(this);

					delete soundTransforms[this[SPID]];
				}
			},
			fake: {
				'position': {
					get: function get_position() {
						var id = this[SPID];
						
						// Sound not started, position is 0.0
						if(!soundPositions[id])
							return 0;
						
						// Time elapsed since now
						return Date.now() - soundPositions[id];
					}
				}
			}
		},
		patch: function patch(target, patch, mutator) {
			if(hasProperty(patch, 'startTime'))
				soundPositions[target[SPID]] = Date.now() - patch.startTime;
			
			if(patch.destroy) {
				// Destroy the object silently (native already knows)
				silence(target.destroy, target);
				// Remove it's timer reference
				delete soundPositions[target[SPID]];
			}
		}
	});
});
