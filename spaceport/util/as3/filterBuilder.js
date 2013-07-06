define('util/as3/filterBuilder', [
	'util/as3/inherit',
	'util/js/nameFunction',
	'shared/default',
	'util/constructRef',
	'shared/hasProperty',
	'flash/filters/BitmapFilter',
	'util/oop/cast',
	'util/oop/instanceof'
], function(
	__inherit,
	__name_function,
	__default,
	__construct_ref,
	hasProperty,
	BitmapFilter,
	__cast,
	__instanceof
) {
	// Props are an array of ['name', defaultValue]
	return function filterBuilder(name, props) {
		var filter = __name_function(name, function(value) {
			// Coersion
			if(!__instanceof(this, filter))
				return __cast(value, filter);

			for(var i=0; i<props.length; ++i)
				this[props[i][0]] = __default(arguments[i], props[i][1]);
		});
		
		filter.build = function build(patch) {
			var result = new filter();
			for(var i=0; i<props.length; ++i) {
				var key = props[i][0];
				if(hasProperty(patch, key))
					result[key] = patch[key];
			}
			
			return result;
		};
		
		return __inherit(filter, BitmapFilter, {
			'clone': function clone() {
				var result = new filter();
				for(var i=0; i<props.length; ++i) {
					var key = props[i][0];
					result[key] = this[key];
				}
				
				return result;
			},
			'nativeSerialize': function nativeSerialize() {
				var self = this;
				return __construct_ref(name, props.map(function(prop, index) {
					return self[prop[0]];
				}));
			}
		});
	};
});
