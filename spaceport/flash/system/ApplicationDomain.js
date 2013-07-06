define('flash/system/ApplicationDomain', [
	'proxy/create',
	'bridge/send',
	'util/js/nameFunction',
	'shared/defineReadOnly',
	'util/oop/instanceof',
	'util/oop/cast',
	'util/as3/inherit',
	'util/as3/fqnToClassName',
	'domain/mainDomain',
	'domain/Domain',
	'domain/applicationDomainDomains',
	'shared/hasProperty',
	'spid',
	'util/as3/makeFQN',
	'proxy/ProxyClass',
	'flash/display/BitmapData'
], function(
	createProxyClass,
	send,
	__name_function,
	defineReadOnly,
	__instanceof,
	__cast,
	__inherit,
	__as3_fqn,
	mainDomain,
	Domain,
	applicationDomainDomains,
	hasProperty,
	SPID,
	makeFQN,
	ProxyClass,
	BitmapData
) {
	function createClass(name, patch, appDomain, mutator) {
		var superclass = mutator.domain.getClass(patch.$);
		var baseClass = superclass.shadow;

		var fqn = makeFQN(name);

		var result = __name_function(fqn, function(value) {
				// Automatic casting is not needed in the land of untyped
				// If items do not share common prototype, error out
			if(!__instanceof(this, result))
				return __cast(value, result);

			result.shadow.apply(this);

			send('create', appDomain, this, name);
		});

		result.shadow = __name_function(fqn, function(value) {
				// Automatic casting is not needed in the land of untyped
				// If items do not share common prototype, error out
			if(!__instanceof(this, result))
				return __cast(value, result);
			
			// XXX: BitmapData needs constructor arguments.
			// For the lack of better solution...
			if(__instanceof(this, BitmapData))
				baseClass.call(this, patch.width, patch.height);
			else
				baseClass.call(this);

			mutator.patch(this, patch);
		});

		__inherit(result, superclass);

		result.shadow.prototype = result.prototype;

		return result;
	}

	return createProxyClass('ApplicationDomain', {
		alwaysShadow: true,
		patch: function(target, patch, mutator) {
			// First, build a domain
			var domain = new Domain('ApplicationDomain'); // TODO Use swf name
			var domainMutator = mutator.augment(domain);

			for(var className in patch) {
				if(className === '$')
					continue;

				var classPatch = patch[className];
				if(typeof classPatch !== 'object')
					continue;

				var classObject = createClass(className, classPatch, target, domainMutator);
				var fqn = makeFQN(className);
				domain.classes[fqn] = classObject;
				domain.classInfos[fqn] = {
					'patch': classPatch
				};
			}

			// Make sure we can get to the domain object later on
			// ApplicationDomain#destroy
			applicationDomainDomains[target[SPID]] = domain;

			// Add classes of the domain to the global lookup
			mainDomain.addDomain(domain);

			// Grab all the classes and claim them as our own
			defineReadOnly(target, 'definitions', domain.getAllClassesCopy());
		},
		methods: {
			fake: {
				'definitions': {
					get: function get_definitions() {
						return {};
					}
				},
				'getDefinition': function getDefinition(name) {
					var fqn = makeFQN(name);
					if(!this.definitions[fqn])
						throw new ReferenceError('Variable ' + name + ' is not defined.');
					
					return this.definitions[fqn];
				},
				'hasDefinition': function hasDefinition(name) {
					var fqn = makeFQN(name);
					return !!this.definitions[fqn];
				},
				'destroy': function destroy(deep) {
					ProxyClass.prototype.destroy.call(this);

					if(hasProperty(applicationDomainDomains, this[SPID])) {
						var domain = applicationDomainDomains[this[SPID]];
						mainDomain.removeDomain(domain);
						delete applicationDomainDomains[this[SPID]];
					}
				}
			}
		}
	});
});
