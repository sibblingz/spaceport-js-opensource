define('bridge/bufferOptimizer', [
	'bridge/buffer',
	'bridge/dictionary',
	'bridge/ssa'
], function(
	buffer,
	dictionary,
	ssa
) {
	// ssa global variable is a map:
	// scope => propertyName => (buffer, setIndex)

	var TYPE = 0;
	var SCOPE = 1;
	var ID = 2;
	var ARGS_START = 3;

	var SSA_BUFFER = 0;
	var SSA_SET_INDEX = 1;

	// Merges set commands which are on the same object
	//
	// Converts
	//   set x 6
	//   set y 8
	// into
	//   set x 6 y 8
	function mergeCommands(prev, next) {
		// Only merge commands of the same type and scope
		if(prev[TYPE] !== next[TYPE] || prev[SCOPE] !== next[SCOPE])
			return false;

		// Only merge set commands
		if(prev[TYPE] !== 'set')
			return false;
		
		var setIndex = prev.length;
		prev.push.apply(prev, next.slice(ARGS_START));
		putSSA(next, prev, setIndex);
		
		return true;
	}
	
	// Removes the command at index
	//
	// This causes a merge if the commands adjacent to the removed command can
	// be merged.
	function removeCommand(index) {
		buffer.splice(index, 1);
		
		var previous = buffer[index - 1];
		var next = buffer[index];
		
		if(previous && next) {
			if(mergeCommands(previous, next))
				removeCommand(buffer.indexOf(next));
		}
	}
	
	function getSSA(command) {
		if(command[TYPE] !== 'set')
			return;
		
		return ssa[command[SCOPE]] && ssa[command[SCOPE]][command[ARGS_START]];
	}
	
	// Put a set command in SSA 'tree'
	function putSSA(command, buffer, setIndex) {
		if(command[TYPE] !== 'set')
			return;
		
		if(!ssa[command[SCOPE]])
			ssa[command[SCOPE]] = {};
			
		for(var i=ARGS_START; i<command.length; i+=2) {
			// Array indices correspond to SSA_BUFFER, SSA_SET_INDEX
			ssa[command[SCOPE]][command[i]] = [buffer, setIndex + i - ARGS_START];
		}
	}
	
	// Deletes old set commands if the same property is set again
	//
	// Converts
	//   set x 5
	//   [one or more set or destroy commands]
	//   set x 7
	// into
	//   set x 7
	function delSSA(command) {
		var ssaLocation = getSSA(command);
		if(!ssaLocation || command[TYPE] !== 'set')
			return;
		
		var commandBuffer = ssaLocation[SSA_BUFFER];
		var setIndex = ssaLocation[SSA_SET_INDEX];

		// Delete this property from the command buffer
		commandBuffer.splice(setIndex, 2);

		// Delete this property from the SSA tree
		var id = command[SCOPE];
		delete ssa[id][command[ARGS_START]];

		if(commandBuffer.length < 4) {
			// If the command is now empty (i.e. set command with no set
			// properties), remove it
			removeCommand(buffer.indexOf(commandBuffer));
		} else {
			// Otherwise, fix all SSA references to the command buffer we
			// modified
			for(var property in ssa[id]) {
				var ssaProperty = ssa[id][property];
				if(ssaProperty[SSA_BUFFER] === commandBuffer && ssaProperty[SSA_SET_INDEX] > setIndex)
					ssaProperty[SSA_SET_INDEX] -= 2;
			}
		}
	}

	// Inserts a command into the buffer, optimizing if possible.
	//
	// If the command can later be removed by unsend, it is returned.
	// Otherwise, null is returned.
	return function bufferOptimizer(command) {
		// We can only optimize set/destroy commands
		if(!(command[TYPE] === 'set' || command[TYPE] === 'destroy')) {
			buffer.push(command);
			return command;
		}
		
		delSSA(command);

		if(buffer.length && mergeCommands(buffer[buffer.length - 1], command)) {
			// Commands merged; do nothing else
			return null;
		} else {
			putSSA(command, command, 3);
			buffer.push(command);
			return null;
		}
	};
});
