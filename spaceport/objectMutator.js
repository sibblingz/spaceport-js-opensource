define('objectMutator', [
	'bridge/silence',
	'util/builtin/slice',
	'shared/defineReadOnly',
	'shared/hasProperty',
	'shared/internalError',
	'domain/AggregateDomain'
], function(
	silence,
	slice,
	defineReadOnly,
	hasProperty,
	internalError,
	AggregateDomain
) {
	var PRIMITIVE_TYPES = ['number', 'string', 'boolean'];
	
	// Each object mutator is immutable/pure
	return function objectMutator(mutatorDomain) {
		function isPrimitive(value) {
			// TODO Make this better.
			return PRIMITIVE_TYPES.indexOf(typeof value) >= 0;
		}

		function patchObject(target, patch, type, mutator) {
			// No patch function to apply the patch; just return the target.
			if(!type.patch)
				return target;

			var newTarget = type.patch(target, patch, mutator);

			// No replacement object returned; target itself was patched.
			if(newTarget == null) // Fuzzy compare
				return target;

			// Target may have changed; return the new target.
			return newTarget;
		}

		function buildObject(patch, type, mutator) {
			// Build an object from scratch.
			if(type.build) {
				// A builder function was given; use it.
				return type.build(patch, mutator);
			}

			// The default builder just calls the patcher with a new
			// (shadowed) instance of the patch's type.
			return mutateObject(new type.shadow(), patch);
		}

		function getType(target, patch) {
			// The patch's $ property takes priority.
			if(patch.$)
				return mutatorDomain.getClass(patch.$);

			// If no $ property is given, guess from the target's type.
			if(target != null) // Fuzzy compare
				return target.constructor;

			return null;
		}

		function patchObjectProperties(target, patch, properties) {
			// Apply each property to the target iff it exists in the patch.
			// Patch properties are treated as new objects to mutate, and are
			// built or patched as appropriate.
			silence(function() {
				properties.forEach(function(propertyName) {
					if(hasProperty(patch, propertyName))
						target[propertyName] = mutateObject(target[propertyName], patch[propertyName]);
				});
			});

			return target;
		}

		function patchObjectPropertiesReadOnly(target, patch, properties) {
			// Identical to patchObjectProperties, except the resulting
			// properties are read-only.
			// TODO Remove duplication with patchObjectProperties code
			silence(function() {
				properties.forEach(function(propertyName) {
					if(hasProperty(patch, propertyName))
						defineReadOnly(target, propertyName, mutateObject(target[propertyName], patch[propertyName]));
				});
			});

			return target;
		}

		function augment(domain) {
			// Creates a new mutator with the given domains added this
			// mutator's list of domains
			// FIXME This may be a source of GC inefficiency
			var newDomain = new AggregateDomain(null);
			newDomain.addDomain(mutatorDomain);
			newDomain.addDomain(domain);
			return objectMutator(newDomain);
		}

		var mutator = {
			domain: mutatorDomain, // Don't edit me~

			// Allow people to recursively build/patch an object.
			patch: mutateObject,

			// Helper functions
			patchObjectProperties: patchObjectProperties,
			patchObjectPropertiesReadOnly: patchObjectPropertiesReadOnly,

			augment: augment
		};

		function mutateObject(target, patch, domain) {
			// TODO How should arrays be handled? Should they automatically be
			// patched, or should patchers explicitly handle them?

			// If the patch is a primitive, the object is immutable and already
			// constructed. We can thus just return the object.
			if(isPrimitive(patch))
				return patch;

			// Augment if a domain is given
			if(domain)
				return augment(domain).patch(target, patch);

			var type = getType(target, patch);

			if(DEBUG) {
				if(!type) {
					var targetType = target && target.constructor && target.constructor.name;
					var targetTypeString = targetType ? 'target type: ' + targetType : 'target is null';
					var patchTypeString = patch.$ ? 'patch type: ' + patch.$ : 'patch data: ' + JSON.stringify(patch);

					internalError(2000, "Could not determine type of patch or target; " + targetTypeString + "; " + patchTypeString);
				}
			}

			if(CUSTOMER_DEBUG) {
				if(!type) {
					internalError(2000, "An internal deserialization error occured");
				}
			}

			// There is no target; build a new object. This will likely cause
			// the built object to be patched, depending on how the type's
			// builder is implemented.
			if(target == null) // Fuzzy compare
				return buildObject(patch, type, mutator);

			// There is a target; patch the object.
			while(type) {
				// Walk up the class chain, applying the patch using each
				// class's patcher.
				// FIXME Should this be done in reverse?
				target = patchObject(target, patch, type, mutator);

				type = type.superclass;
			}

			return target;
		}

		return mutator;
	};
});
