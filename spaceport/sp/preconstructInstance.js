define('sp/preconstructInstance', [
	'spmetadata',
	'util/oop/getPrototypeOf',
], function(
	SPMETADATA,
	getPrototypeOf
) {
	return function preconstructInstance(instance) {
		var preconstructors = [];
		var metadata, preconstructor;

		// Get the list of preconstructors for this instance.
		var proto = getPrototypeOf(instance);
		while (proto && proto !== Object.prototype) {
			var ctor = proto.constructor || Object;
			metadata = ctor[SPMETADATA];
			if (metadata) {
				preconstructor = metadata.preconstruct;
				if (preconstructor) {
					preconstructors.push(preconstructor);
				}
			}
			proto = getPrototypeOf(ctor.prototype || Object.prototype);
		}

		// Call preconstructors, superclasses first.
		preconstructors.reverse();
		preconstructors.forEach(function(preconstructor) {
			preconstructor.call(instance);
		});
	};
});
