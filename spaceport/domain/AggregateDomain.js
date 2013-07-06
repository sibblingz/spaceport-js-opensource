define('domain/AggregateDomain', [
	'util/oop/inherit',
	'shared/apply'
], function(
	__js_inherit,
	apply
) {
	function find(domains, methodName, arg) {
		// Must iterate backwards (later domains take precedence)
		var i = domains.length;
		while(i --> 0) {
			var domain = domains[i];
			var classObject = domain[methodName](arg);
			if(classObject != null) {
				return classObject;
			}
		}

		return null;
	}
	
	function AggregateDomain(name) {
		this.domains = [];
	}

	return __js_inherit(AggregateDomain, Object, {
		'addDomain': function addDomain(domain) {
			if(this.domains.indexOf(domain) < 0) {
				this.domains.push(domain);
			}
		},
		'removeDomain': function removeDomain(domain) {
			var index = this.domains.indexOf(domain);
			if(index >= 0) {
				this.domains.splice(index, 1);
			}
		},
		'getAllFQNs': function getAllFQNs() {
			// TODO Clean up overlaps
			return this.domains.reduce(function(acc, domain) {
				return acc.concat(domain.getAllFQNs());
			}, []);
		},
		'getClass': function getClass(fqn) {
			return find(this.domains, 'getClass', fqn);
		},
		'getAllClassesCopy': function getAllClassesCopy() {
			return this.domains.reduce(function(acc, domain) {
				return apply(acc, domain.getAllClassesCopy());
			}, {});
		},
		'getClassInfo': function getClassInfo(fqn) {
			return find(this.domains, 'getClassInfo', fqn);
		},
		'getPackage': function getPackage(packageName) {
			return this.domains.reduce(function(acc, domain) {
				return apply(acc, domain.getPackage(packageName));
			}, {});
		},
		'getFQNOfClass': function getFQNOfClass(classObject) {
			return find(this.domains, 'getFQNOfClass', classObject);
		}
	});
});
