define('util/loaderPatcher', [], function() {
	return function loaderPatcher(target, patch, mutator) {
		mutator.patchObjectPropertiesReadOnly(target, patch, ['bytesLoaded', 'bytesTotal']);
	};
});
