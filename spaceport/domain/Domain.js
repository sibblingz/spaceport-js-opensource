define('domain/Domain', [
	'util/oop/inherit',
	'shared/hasProperty',
	'util/as3/fqnToPackageName',
	'util/as3/fqnToClassName',
	'util/as3/makeFQN',
	'shared/apply',
	'shared/objectKeys'
], function(
	__js_inherit,
	hasProperty,
	fqnToPackageName,
	fqnToClassName,
	makeFQN,
	apply,
	objectKeys
) {
	function Domain(name) {
		this.name = name;
		this.classes = {};
		this.classInfos = {};
	}
	
	return __js_inherit(Domain, Object, {
		'getAllFQNs': function getAllFQNs() {
			return objectKeys(this.classes);
		},
		'getClass': function getClass(fqn) {
			if(hasProperty(this.classes, fqn))
				return this.classes[fqn];

			fqn = makeFQN(fqn);
			if(hasProperty(this.classes, fqn))
				return this.classes[fqn];
			
			return null;
		},
		'getAllClassesCopy': function getAllClassesCopy() {
			return apply({}, this.classes);
		},
		'getClassInfo': function getClassInfo(fqn) {
			if(hasProperty(this.classInfos, fqn))
				return this.classInfos[fqn];

			fqn = makeFQN(fqn);
			if(hasProperty(this.classInfos, fqn))
				return this.classInfos[fqn];
			
			return null;
		},
		'getPackage': function getPackage(packageName) {
			var classes = this.classes;
			return objectKeys(classes).reduce(function(acc, fqn) {
				if(fqnToPackageName(fqn) === packageName)
					acc[fqnToClassName(fqn)] = classes[fqn];

				return acc;
			}, {});
		},
		'getFQNOfClass': function getFQNOfClass(classObject) {
			var classes = this.classes;
			for(var fqn in classes) {
				if(hasProperty(classes, fqn) && classes[fqn] === classObject)
					return fqn;
			}

			return null;
		}
	});
});
