define('flash/Sound', [
	'features',
	'dom/attachOne',
	'bridge/send',
	'bridge/removeFromDictionary',
	'util/lightClass',
	'util/nextTick',
	'shared/internalError',
	'pendingSoundCalls'
], function(
	features,
	attachOne,
	send,
	removeFromDictionary,
	lightClass,
	nextTick,
	internalError,
	pendingSoundCalls
) {
	var IOS_NO_SOUND_BUG = features.IOS_NO_SOUND_BUG;

	var SoundPool = lightClass({
		constructor: function SoundPool(sources) {
			this.sources = sources;
			this.freeSounds = [ ];
			this.takenSounds = [ ];
		},
		'any': function any() {
			var sound = this.freeSounds[0] || this.takenSounds[0];

			if(!sound) {
				sound = this.alloc();
				this.free(sound);
			}

			return sound;
		},
		'makeNew': function makeNew() {
			var sound = new Audio();
			this.sources.forEach(function(source) {
				sound.appendChild(source.cloneNode(true));
			});
			return sound;
		},
		'alloc': function alloc() {
			var sound = this.freeSounds.pop();

			if(!sound) {
				sound = this.makeNew();
			}

			this.takenSounds.push(sound);

			return sound;
		},
		'free': function free(sound) {
			var index = this.takenSounds.indexOf(sound);

			if(index < 0) {
				internalError(230, "Sound was free'd but not alloc'd!");
			}

			//sound.pause();

			this.takenSounds.splice(index, 1);
			this.freeSounds.push(sound);
		}
	});

	function promise() {
		var theData, isFired = false;
		var pendingCallbacks = [ ];

		return {
			then: function(callback, context) {
				if(isFired)
					callback.call(context, theData);
				else
					pendingCallbacks.push(callback.bind(context));
			},
			fire: function(data) {
				theData = data;
				isFired = true;

				var callback;
				while ((callback = pendingCallbacks.pop()))
					callback(theData);
			}
		};
	}

	var SoundChannel = lightClass({
		constructor: function(soundPool) {
			this.soundPool = soundPool;
			this.audio = soundPool.alloc();
			this.isPlaying = false;

			this.endAll = promise();
			this.endAll.then(function() {
				send(this, {
					$: 'Event',
					type: 'soundComplete',
					bubbles: false,
					cancelable: false
				});

				this.stop();

				removeFromDictionary(this);
			}, this);

			attachOne(this.audio, 'pause', function() {
				this.soundPool.free(this.audio);
				this.audio = null;
			}, this);

			this.load = promise();
			if (IOS_NO_SOUND_BUG) {
				this.load.fire();
			} else {
				attachOne(this.audio, 'canplaythrough', function() {
					this.load.fire();
				}, this);
			}

			if(this.audio.readyState >= this.audio.HAVE_FUTURE_DATA) {
				// In case we're using a pre-cached audio instance
				this.load.fire();
			}

			this.audio.load();
		},
		'play': function(startTime, loops, sndTransform) {
			if(loops < 0)
				return;

			var self = this;

			this.isPlaying = true;

			this.load.then(function() {
				if(this.isPlaying) {
					//self.audio.currentTime = startTime / 1000;
					function doPlay() {
						self.audio.play();
					}

					if (IOS_NO_SOUND_BUG) {
						pendingSoundCalls.push(doPlay);
					} else {
						doPlay();
					}
				}
			}, this);

			attachOne(this.audio, 'ended', function() {
				var audio = this.audio;

				if(loops <= 0) {
					if(audio && audio.currentTime < startTime / 1000) {
						// Seeked past actual end; don't fire event
						//self.stop();
					} else
						this.endAll.fire();
				} else {
					this.play(startTime, loops - 1, sndTransform);
				}
			}, this);
		},
		'stop': function() {
			this.isPlaying = false;
			this.audio.pause();
		}
	});

	var Sound = lightClass({
		constructor: function(stream, context) {
			this.soundPool = null;

			if(stream)
				this.load(stream, context);
		},
		'load': function(stream, context) {
			// TODO context?

			var sources = [ ];

			var source = document.createElement('source');
			source.src = stream.url;
			sources.push(source);

			if(/\.mp3$/i.test(stream.url)) {
				// Offer .OGG/Vorbis for Firefox
				source = document.createElement('source');
				source.src = stream.url + '.ogg';
				source.type = 'audio/ogg; codecs="vorbis"';
				sources.push(source);
			}

			this.soundPool = new SoundPool(sources);

			var audio = this.soundPool.any();
			audio.addEventListener('error', function() {
				// TODO Error handling
			}, true);

			function loadCompletedCallback() {
				// Sadly, there is no 'loaded' event.  This is the cleanest
				// solution closest to 'loaded' or 'complete'.
				send(this, {
					$: 'Event',
					type: 'complete',
					cancelable: false,
					bubbles: false
				});

				audio = null;
			}

			if (IOS_NO_SOUND_BUG) {
				// iOS never sends a canplaythrough callback.  It never loads
				// any sounds.  We pretend the sound did load so games don't
				// stall during loading.
				nextTick(loadCompletedCallback, this);
			} else {
				attachOne(audio, 'canplaythrough', loadCompletedCallback, this);
			}

			audio.load();
		},
		'play': function(startTime, loops, sndTransform) {
			// loops should be cast to an int in range [1,Infinity)
			loops = loops >> 0;
			if(loops <= 0 || isNaN(loops))
				loops = 0;

			if(startTime <= 0 || isNaN(startTime))
				startTime = 0;

			var channel = new SoundChannel(this.soundPool);
			channel.play(startTime, loops, sndTransform);
			return channel;
		}
	});

	return Sound;
});
