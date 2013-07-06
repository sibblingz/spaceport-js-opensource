define('ascompat', [
	'util/nativeClassNames',
	'util/nativeClasses',
	'util/as3/makeClassToString',
	'shared/defineProperty',
	'shared/applyNonEnumerable'
], function(
	nativeClassNames,
	nativeClasses,
	makeClassToString,
	defineProperty,
	applyNonEnumerable
) {
	// ActionScript 3 global compatibility members
	// Assumes nodecompat
	
	(function() { 
		var CASEINSENSITIVE		= 1;
		var DESCENDING			= 2;
		var UNIQUESORT			= 4;
		var RETURNINDEXEDARRAY	= 8;
		var NUMERIC				= 16;
		
		Array.CASEINSENSITIVE    = CASEINSENSITIVE;
		Array.DESCENDING         = DESCENDING;
		Array.UNIQUESORT         = UNIQUESORT;
		Array.RETURNINDEXEDARRAY = RETURNINDEXEDARRAY;
		Array.NUMERIC            = NUMERIC;
		
		function sorter(a, b, cls) {
			a = cls(a);
			b = cls(b);
			
			if(a === b)
				return  0;
			else if(a < b)
				return +1;
			else
				return -1;
		}
		
		applyNonEnumerable(Array.prototype, {
			'sortOn': function sortOn(fieldName, options) {
				fieldName = [].concat(fieldName);
				options = [].concat(options);
				
				// Make sure the lengths are the same
				var duplicate = (fieldName.length !== options.length);
				fieldName.forEach(function(elem, index) {
					options[index] |= 0;
					
					if(duplicate)
						options[index] = options[0];
				});
				
				return this.sort(function(a, b) {
					var result = 0;
					for(var field=0; field<fieldName.length; ++field) {
						var fld = fieldName[field]
						var opts = options[field];
						
						var cls = String;
						if(opts & NUMERIC)
							cls = Number;
						
						if(opts & DESCENDING)
							result = sorter(a[fld], b[fld], cls);
						else
							result = sorter(b[fld], a[fld], cls);
							
						if(result == 0)
							continue;
						
						return result;
					}
					
					return result;
				});
			}
		});
	})();

    defineProperty(Date.prototype, 'time', {
		enumerable: false,
		get: function get_time() {
			return +this;
		}
	});

	// Defines toString on each native "class".
	nativeClasses.forEach(function(cls, i) {
		defineProperty(cls, 'toString', {
			enumerable: false,
			value: makeClassToString(nativeClassNames[i])
		});
	});
});
