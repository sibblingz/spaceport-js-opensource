define('flash/ApplicationDomain', [
	'shared/objectKeys',
	'util/lightClass'
], function(
	objectKeys,
	lightClass
) {
	var ApplicationDomain = lightClass({
		constructor: function ApplicationDomain() {
			this.definitions = {};
		},
		'getConstructor': function getConstructor(name) {
			if(Object.prototype.hasOwnProperty.call(this.definitions, name)) {
				var def = this.definitions[name];

				return function() {
					var instance = def.clone();
					instance.activate();
					return instance;
				};
			} else {
				return null;
			}
		},
		'writeDescriptor': function writeDescriptor(object) {
			object.$ = 'ApplicationDomain';

			objectKeys(this.definitions).forEach(function(key) {
				object[key] = {};
				this.definitions[key].writeDescriptor(object[key]);
			}, this);
		}
	});

	return ApplicationDomain;
});
