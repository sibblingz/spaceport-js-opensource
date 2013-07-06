define('sp/ProductSet', [
	'proxy/create',
	'flash/events/EventDispatcher',
	'shared/defineReadOnly',
	'shared/hasProperty'
], function(
	createProxyClass,
	EventDispatcher,
	defineReadOnly,
	hasProperty
) {
	return createProxyClass('ProductSet', EventDispatcher, {
		constructor: function ProductSet(productList) {
			defineReadOnly(this, 'products', {});
			defineReadOnly(this, 'incompletePurchases', []);
		},
		methods: {
			fake: {
				'getProductData': function getProductData(productId) {
					if(!this.productValidated(productId))
						throw new ReferenceError('Product ' + productId + ' is not validated.');
					
					return this.products[productId];
				},
				'productValidated': function productValidated(productId) {
					return hasProperty(this.products, productId);
				}
			},
			real: {
				'purchase': function purchase(productId) {
					if(!this.productValidated(productId))
						throw new ReferenceError('Product ' + productId + ' is not validated.');
				},
				'finalize': function(transactionId) {
					for(var i=0; i<this.incompletePurchases.length; ++i) {
						if(this.incompletePurchases[i].transactionId != transactionId)
							continue;
						
						this.incompletePurchases.splice(i, 1);
						return;
					}
				}
			}
		},
		patch: function(target, patch, mutator) {
			for(var productId in patch.products) {
				if(hasProperty(patch.products, productId))
					target.products[productId] = patch.products[productId];
 			}
			
			if(patch.incomplete)
				target.incompletePurchases.push(patch.incomplete);
		}
	});
});
