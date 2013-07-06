define('flash/net/Socket', ['proxy/create', 'flash/events/EventDispatcher', 'spid', 'flash/utils/ByteArray', 'bridge/send', 'shared/base64/decodeToByteArray'], function(createProxyClass, EventDispatcher, SPID, ByteArray, send, base64DecodeToByteArray) {
	var inputBuffer = {};
	var outputBuffer = {};
	
	function makeReader(method) {
		return function() {
			var buffer = inputBuffer[this[SPID]];
			return buffer[method].apply(buffer, arguments);
		};
	}
	
	function makeWriter(method) {
		return function() {
			var buffer = outputBuffer[this[SPID]];
			return buffer[method].apply(buffer, arguments);
		};
	}
	
	function compactBuffer(byteArray, newData) {
		var numBytesOfUnreadData = byteArray.bytesAvailable;
		byteArray.length = numBytesOfUnreadData + newData.bytesAvailable;

		if(byteArray.position > 0 && numBytesOfUnreadData > 0) {
			var startingFromZero = new Uint8Array(byteArray.buffer);
		
			var viewStartingFromOffset = new Uint8Array(byteArray.buffer, byteArray.position, numBytesOfUnreadData);
			startingFromZero.set( viewStartingFromOffset );
		}
		
		if(newData.bytesAvailable > 0) {
			var viewStartingFromTheEnd = new Uint8Array(byteArray.buffer, numBytesOfUnreadData);
			var viewOfJustNewData = new Uint8Array(newData.buffer, newData.position, newData.bytesAvailable);
			
			viewStartingFromTheEnd.set( viewOfJustNewData );
		}

		byteArray.position = 0;
/*
		var oldDataPosition = byteArray.position;
		var remainingData = byteArray.bytesAvailable;
		
		byteArray.position = 0;
		if(remainingData != 0 && oldDataPosition != 0)
			byteArray.writeBytes(byteArray, oldDataPosition, remainingData);
		
		byteArray.writeBytes(newData);
		byteArray.position = 0;
*/
	}
	
	return createProxyClass('Socket', EventDispatcher, {
		constructor: function Socket(host, port) {
			inputBuffer[this[SPID]] = new ByteArray();
			outputBuffer[this[SPID]] = new ByteArray();
		},
		patch: function(target, patch, mutator) {
			mutator.patchObjectPropertiesReadOnly(target, patch, ['connected']);
			
			if(patch.data)
				compactBuffer(inputBuffer[target[SPID]], base64DecodeToByteArray(patch.data));
		},
		properties: {
			'timeout': 20000
		},
		methods: {
			fake: {
				'bytesAvailable': {
					get: function() {
						return inputBuffer[this[SPID]].bytesAvailable;
					}
				},
				'bytesPending': {
					get: function() {
						return outputBuffer[this[SPID]].bytesAvailable;
					}
				},
				'connected': {
					get: function() {
						return false;
					}
				},
				'endian': {
					get: function get_endian() {
						return inputBuffer[this[SPID]].endian;
					},
					set: function set_endian(value) {
						inputBuffer[this[SPID]].endian = value;
						outputBuffer[this[SPID]].endian = value;
					}
				},
				'flush': function flush() {
					var buffer = outputBuffer[this[SPID]];
					
					// Don't send an empty buffer
					if(buffer.length) {
						send('execute', this, null, 'flush', buffer);
						
						// Empty the output buffer for next write
						buffer.length = 0;
						buffer.position = 0;
					}
				},
				// Readers from input buffer
				'readBoolean': makeReader('readBoolean'),
				'readByte': makeReader('readByte'),
				'readBytes': makeReader('readBytes'),
				'readDouble': makeReader('readDouble'),
//				'readDouble': makeReader('readDouble'),
				'readFloat': makeReader('readFloat'),
				'readInt': makeReader('readInt'),
				'readMultiByte': makeReader('readMultiByte'),
				'readShort': makeReader('readShort'),
				'readUnsignedByte': makeReader('readUnsignedByte'),
				'readUnsignedInt': makeReader('readUnsignedInt'),
				'readUnsignedShort': makeReader('readUnsignedShort'),
				'readUTF': makeReader('readUTF'),
				'readUTFBytes': makeReader('readUTFBytes'),
				// Writers to output buffer
				'writeBoolean': makeWriter('writeBoolean'),
				'writeByte': makeWriter('writeByte'),
				'writeBytes': makeWriter('writeBytes'),
//				'writeDouble': makeWriter('writeDouble'),
				'writeFloat': makeWriter('writeFloat'),
				'writeInt': makeWriter('writeInt'),
				'writeMultiByte': makeWriter('writeMultiByte'),
				'writeShort': makeWriter('writeShort'),
				'writeUnsignedInt': makeWriter('writeUnsignedInt'),
				'writeUTF': makeWriter('writeUTF'),
				'writeUTFBytes': makeWriter('writeUTFBytes'),
				// ProxyClass override				
				'destroy': function(deep) {
					EventDispatcher.prototype.destroy.call(this, deep);
					
					delete inputBuffer[this[SPID]];
					delete outputBuffer[this[SPID]];
				}
			},
			real: {
				'close': true,
				'connect': function() {
					inputBuffer[this[SPID]].clear();
					outputBuffer[this[SPID]].clear();
				}
			}
		}
	});
});
