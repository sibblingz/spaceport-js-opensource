define('flash/utils/ByteArray', [
	'util/builtin/slice',
	'util/as3/inherit',
	'util/oop/instanceof',
	'shared/defineGetter',
	'shared/defineSetter',
	'shared/fromCharCode',
	'shared/utf8/encode',
	'shared/utf8/decode',
	'shared/base64/encode',
	'flash/utils/Endian',
	'flash/errors/EOFError',
	'proxy/ISpaceportSerializable'
], function(
	slice,
	__inherit,
	__instanceof,
	defineGetter,
	defineSetter,
	fromCharCode,
	utf8Encode,
	utf8Decode,
	base64Encode,
	Endian,
	EOFError,
	ISpaceportSerializable
) {
	try {
		// Sometimes (iOS 5.1.1 on iPhone 4), Uint8Array is a callable object.
		// At other times, it is a normal function.
		//
		// Constructing a Uint8Array is the most reliable way to detect if it
		// is supported.
		new Uint8Array(1);
	} catch(e) {
		return function ByteArray() {
			throw new Error("ByteArray not supported on current platform");
		};
	}
	
	function arraysEqual(xs, ys, length) {
		for(var i = 0; i < length; ++i) {
			if(xs[i] !== ys[i])
				return false;
		}
		return true;
	}

	function endianness() {
		var magic = 0x01234567;
		var magicLE = [0x67, 0x45, 0x23, 0x01];
		var magicBE = [0x01, 0x23, 0x45, 0x67];
		var uint32 = new Uint32Array([magic]);
		var uint8 = new Uint8Array(uint32.buffer);

		if(arraysEqual(uint8, magicLE, 4))
			return 'little';
		if(arraysEqual(uint8, magicBE, 4))
			return 'big';
		throw new Error(
			"Could not determine typed array endianness of executing platform:\n"
			+ "With magic: 0x" + magic.toString(16) + " "
			+ "got bytes: [" + [uint8[0], uint8[1], uint8[2], uint8[3]].join(", ") + "]"
		);
	}
	
	var ALLOCATION_GROW_BYTES = 16;
	var workArea = new Uint8Array(8);
	var nativeLittleEndian = endianness() === 'little';

	function read(buffer, type, offset, le) {
		var size = type.BYTES_PER_ELEMENT;
	
		if(size === 1 || le === nativeLittleEndian) {
			// Aligned read
			if((offset % size) === 0) {
				return (new type(buffer, offset, 1))[0];
			} else {
				// Copy bytes into the temp array, to fix alignment
				var byteReader = new Uint8Array(buffer);
				for(var i=0; i<size; ++i)
					workArea[i] = byteReader[offset + i];
			
				// Now wrap that buffer with an array of the desired type
				return (new type(workArea.buffer))[0];
			}
		} else {
			// If the native endianness doesn't match the desired, then
			// we have to reverse the bytes
			var byteReader = new Uint8Array(buffer);
			for(var i=0; i<size; ++i)
				workArea[size - i - 1] = byteReader[offset + i];
		
			return (new type(workArea.buffer))[0];
		}
	}
	
	function write(buffer, type, offset, value, le) {
		var size = type.BYTES_PER_ELEMENT;
	
		if(size === 1 || le === nativeLittleEndian) {
			// Aligned write
			if((offset % size) === 0) {
				(new type(buffer, offset, 1))[0] = value;
			} else {
				// Unaligned write. Write into the work area
				(new type(workArea.buffer))[0] = value;
			
				// Now copy the bytes into the buffer
				var byteWriter = new Uint8Array(buffer, offset);
				for(var i=0; i<size; ++i)
					byteWriter[i] = workArea[i];
			}
		}
		else {
			// If the native endianness doesn't match the desired, then
			// we have to reverse the bytes

			// Store the value into our temporary buffer
			(new type(workArea.buffer))[0] = value;

			// Now copy the bytes, in reverse order, into the view's buffer
			var byteWriter = new Uint8Array(buffer, offset);
			for(var i=0; i<size; ++i)
				byteWriter[i] = workArea[size - i - 1];
		}
	}
	
	function copy(from, to, where) {
		var f = new Uint8Array(from);
		var t = new Uint8Array(to);
	
		if(f.length && t.length)
			t.set(f, where);
	}
	
	function grow(what, by) {
		what.length = Math.max(what.position + by, what.length);
	}
	
	function append(from, to) {
		var length = from.length;
		grow(to, length);
		copy(from, to.buffer, to.position);

		to.position += length;
	}
	
	function generateWriter(type) {
		return function(value) {
			var length = type.BYTES_PER_ELEMENT;
			grow(this, length);
			write(this.buffer, type, this.position, value, this.endian == Endian.LITTLE_ENDIAN);
			
			this.position += length;
		};
	}
	
	function verifySize(ba, size) {
		if(ba.position + size > ba.length)
			throw new EOFError('There is not sufficient data available to read');
	}
	
	function generateReader(type) {
		return function() {
			var length = type.BYTES_PER_ELEMENT;
			verifySize(this, length);
			
			var value = read(this.buffer, type, this.position, this.endian == Endian.LITTLE_ENDIAN);
			this.position += length;
		
			return value;
		};
	}
	
	function stringToBytes(string) {
		string = utf8Encode(string);
		
		var bytes = [];
		var length = string.length;
		for(var i=0; i<length; ++i)
			bytes[i] = string.charCodeAt(i);
		
		return bytes;
	}
	
	function bytesToString(bytes) {
		var result = '';
		for(var i=0; i<bytes.length; ++i)
		  result += fromCharCode(bytes[i]);
		
		return utf8Decode(result);
	}
	
	function ByteArray() {
		var b = arguments[0];
		var buffer = new ArrayBuffer(0);
		if(__instanceof(b, ArrayBuffer))
			buffer = b;
		
		var position = 0;
		var length = buffer.byteLength;
		var endian = Endian.BIG_ENDIAN;
		
		defineGetter(this, 'length', function() {
			return length;
		});
		defineSetter(this, 'length', function(value) {
			value = Number(value) >>> 0;
		
			// If the user requested more bytes than we currently have allocated
			if(value > buffer.byteLength) {
				// Grow the buffer
				var prev = buffer;
				buffer = new ArrayBuffer(Math.ceil(value / ALLOCATION_GROW_BYTES) * ALLOCATION_GROW_BYTES);
			
				// Copy previous buffer to the new one
				copy(prev, buffer, 0);
			} else {
				// Fill rest with zeros
				copy(new ArrayBuffer(Math.abs(length - value)), buffer, Math.min(length, value));
			}
		
			length = value;
		});
		
		defineGetter(this, 'position', function() {
			return position;
		});
		defineSetter(this, 'position', function(value) {
			position = Number(value) >>> 0;
		});
		
		defineGetter(this, 'endian', function() {
			return endian;
		});
		defineSetter(this, 'endian', function(value) {
			endian = String(value);
		});
		
		defineGetter(this, 'bytesAvailable', function() {
			return Math.max(0, length - position);
		});
		
		defineGetter(this, 'buffer', function() {
			return buffer;
		});
	}
	
	return __inherit(ByteArray, ISpaceportSerializable, {
		clear: function clear() {
			this.length = 0;
			this.position = 0;
		},
		// Writers	
		// Signed writers
		writeByte: generateWriter(Int8Array),
		writeShort: generateWriter(Int16Array),
		writeInt: generateWriter(Int32Array),
		// Unsigned Writers
//		writeUnsignedByte: generateWriter(Uint8Array),
//		writeUnsignedShort: generateWriter(Uint16Array),
		writeUnsignedInt: generateWriter(Uint32Array),
		// Floating points
		writeFloat: generateWriter(Float32Array),
//		writeDouble: generateWriter(Float64Array),
		// Other writers
		writeBoolean: function writeBoolean(value) {
			this.writeByte(Boolean(value));
		},
		// Arrays
		writeBytes: function writeBytes(bytes, offset, length) {
			offset = (Number(offset) >>> 0) || 0;
			length = (Number(length) >>> 0) || (bytes.length - offset);
			
			append(new Uint8Array(bytes.buffer, offset, length), this);
		},
		writeUTF: function writeUTF(value) {
			value = String(value);
			if(value.length > 65535)
				throw new RangeError('The length is larger than 65535');
			
			var bytes = stringToBytes(value);
			
			this.writeShort(bytes.length);
			append(bytes, this);
		},
		writeUTFBytes: function writeUTFBytes(value) {
			append(stringToBytes(value), this);
		},
		writeMultiByte: function writeMultiByte(value, charSet) {
			// XXX: charSet is always 'utf-8'
			this.writeUTFBytes(value);
		},
		// Readers
		// Signed readers
		readByte: generateReader(Int8Array),
		readShort: generateReader(Int16Array),
		readInt: generateReader(Int32Array),
		// Unsigned readers
		readUnsignedByte: generateReader(Uint8Array),
		readUnsignedShort: generateReader(Uint16Array),
		readUnsignedInt: generateReader(Uint32Array),
		// Floating points
		readFloat: generateReader(Float32Array),
//		readDouble: generateReader(Float64Array),
		// Other readers
		readBoolean: function readBoolean() {
			return Boolean(this.readByte());
		},
		// Arrays
		readBytes: function readBytes(bytes, offset, length) {
			offset = (Number(offset) >>> 0) || 0;
			length = (Number(length) >>> 0) || this.bytesAvailable;
			
			verifySize(this, length);
			
			bytes.length = Math.max(bytes.length, offset + length);
		
			copy(new Uint8Array(this.buffer, this.position, length), bytes.buffer, offset);
		
			this.position += length;
		},
		readUTF: function readUTF() {
			return this.readUTFBytes(this.readUnsignedShort());
		},
		readUTFBytes: function readUTFBytes(length) {
			verifySize(this, length);
			
			var result = bytesToString(new Uint8Array(this.buffer, this.position, length));
			this.position += length;

			return result;
		},
		readMultiByte: function readMultiByte(length, charSet) {
			/* XXX: charSet is always 'utf-8' */
			return this.readUTFBytes(length);
		},
		toString: function toString() {
			return bytesToString(new Uint8Array(this.buffer, 0, this.length));
		},
		nativeSerialize: function nativeSerialize() {
			return base64Encode(new Uint8Array(this.buffer, 0, this.length));
		}
	});
});
