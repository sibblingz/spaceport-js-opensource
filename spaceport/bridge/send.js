define('bridge/send', [
	'bridge/buffer',
	'util/builtin/slice',
	'util/translateArgument',
	'bridge/dictionary',
	'bridge/silence',
	'bridge/bufferOptimizer',
	'spid'
], function(
	buffer,
	slice,
	translateArgument,
	dictionary,
	silence,
	bufferOptimizer,
	SPID
) {
	return function send() {
		if(silence.isSilenced)
			return;

		var args = slice.call(arguments);

			// Get id from scope if exists
		if(args[1])
			args[1] = args[1][SPID];
		
			// Has an id? Keep it
		var instance = args[2];
		if(instance) {
			var id = instance[SPID];
			
			args[2] = id;
			dictionary[id] = instance;
		}
		
			// Translate rest of arguments
		for(var i=3; i<args.length; ++i)
			args[i] = translateArgument(args[i]);
			
		return bufferOptimizer(args);
	};
});
