define('sp/init', [
	'flash/display/Sprite',
	'spid',
	'proxy/ProxyClass',
	'bridge/silence',
	'bridge/buffer',
	'stage',
	'flash/events/Event',
	'shared/defineReadOnly',
	'util/display/recurseDisplayObject',
	'util/display/recurseChildren',
	'util/translateArgument',
	'util/builtin/objectCreate'
], function(
	Sprite,
	SPID,
	ProxyClass,
	silence,
	bridgeBuffer,
	stage,
	Event,
	defineReadOnly,
	recurseDisplayObject,
	recurseChildren,
	translateArgument,
	objectCreate
) {
	return function init(DocumentClass) {
		if(typeof DocumentClass !== 'function')
			throw new Error("DocumentClass must be a Class");
		if(!(DocumentClass.prototype instanceof Sprite))
			throw new Error("DocumentClass must subclass flash.display::Sprite");

		// Create the document class instance using the class prototype
		var root = objectCreate(DocumentClass.prototype);
		
		// Give the root an ID
		// The user class' ProxyClass will check for ID existance.
		ProxyClass.call(root);
		
		// Add the root to the stage without manipulating the buffer
		silence(function() {
			stage.addChild(root);
		});
		
		// Define the document class as its own root
		defineReadOnly(root, 'root', root);
		
		// Apply the user constructor after adding to the stage
		DocumentClass.call(root);
		
		// Becasue of various problems caused by stage injection,
		// We inject a command directly 
		for(var i=0; i<bridgeBuffer.length; ++i) {
			if(bridgeBuffer[i][2] !== root[SPID])
				continue;
			
			bridgeBuffer.splice(i + 1, 0, ['execute', 1, null, 'addChild', translateArgument(root)]);
			break;
		}

		// Dispatch events, as Flash does.
		// (See NormalInitTests and StagelessInitTests.)
		root.dispatchEvent(new Event(Event.ADDED, true));

		var event = new Event(Event.ADDED_TO_STAGE);
		recurseChildren(stage, function(displayObject) {
			displayObject.dispatchEvent(event);
		});
	};
});
