define('flash/utils/getQualifiedClassName', [
	'domain/mainDomain',
	'util/as3/fqnToDefinitionName',
	'util/oop/getClassConstructor'
], function(
	mainDomain,
	fqnToDefinitionName,
	getClassConstructor
) {
	return function getQualifiedClassName(value) {
		var classObject = getClassConstructor(value);

		// Special cases (non-objects)
		if(classObject === null) {
			return 'null';
		} else if(typeof classObject === 'undefined') {
			return 'void';
		}

		// Special case: numbers
		if(typeof value === 'number') {
			if(value >> 0 === value  // Integral
			&& value <= 268435455
			&& value >= -268435456) {
				return 'int';
			} else {
				return 'Number';
			}
		}

		// Classes
		var fqn = mainDomain.getFQNOfClass(classObject);
		if(fqn === null) {
			// No FQN found; generate one by guessing
			// FIXME
			return classObject.name;
		} else {
			return fqn;
		}
	};
});
