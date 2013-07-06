define('bridge/classLookup', [
	'flash/Loader',
	'flash/Sprite',
	'flash/Sound',
	'flash/Bitmap',
	'flash/BitmapData',
	'flash/URLLoader',
	'flash/TextField',
	'flash/Shape',
	'flash/MovieClip',
	'flash/Accelerometer'
], function(
	Loader,
	Sprite,
	Sound,
	Bitmap,
	BitmapData,
	URLLoader,
	TextField,
	Shape,
	MovieClip,
	Accelerometer
) {
	return {
		'Sound': Sound,
		'Sprite': Sprite,
		'Loader': Loader,
		'Bitmap': Bitmap,
		'BitmapData': BitmapData,
		'TextField': TextField,
		'Shape': Shape,
		'URLLoader': URLLoader,
		'MovieClip': MovieClip,
		'Accelerometer': Accelerometer,

		// Not supported
		'SoundChannel': Object,
		'ProductSet': Object
	};
});
