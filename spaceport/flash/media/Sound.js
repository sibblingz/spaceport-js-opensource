define('flash/media/Sound', [
	'proxy/create',
	'flash/events/EventDispatcher',
	'flash/media/SoundChannel',
	'util/loaderPatcher',
	'flash/net/URLRequest',
	'util/oop/cast',
	'util/proxy/shadowResult',
	'flash/media/SoundTransform'
], function(
	createProxyClass,
	EventDispatcher,
	SoundChannel,
	loaderPatcher,
	URLRequest,
	__cast,
	shadowResult,
	SoundTransform
) {
	var Sound = createProxyClass('Sound', EventDispatcher, {
		methods: {
			real: {
				'load': [URLRequest],
				'close': []
			},
			fake: {
				'play': function play(startTime, loops, sndTransform) {
					var sndChannel = shadowResult(this, SoundChannel, 'play', arguments);
					
					if(sndTransform)
						sndChannel.soundTransform = __cast(sndTransform, SoundTransform);
					
					return sndChannel;
				}
			}
		},
		patch: loaderPatcher
	});

	return Sound;
});
