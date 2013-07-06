define('sp/PurchaseEvent', [
	'util/as3/eventBuilder',
	'shared/defineReadOnly',
	'shared/default'
], function(
	eventBuilder,
	defineReadOnly,
	__default
) {
	return eventBuilder('PurchaseEvent', {
		args: ['productId', 'receipt', 'transactionId', 'validIds'],
		constructor: function PurchaseEvent(type, bubbles, cancelable, productId, receipt, transactionId, validIds) {
			defineReadOnly(this, 'productId', __default(productId, null));
			defineReadOnly(this, 'receipt', __default(receipt, null));
			defineReadOnly(this, 'transactionId', __default(transactionId, null));
		
			// TODO Use defineReadOnlyArray
			defineReadOnly(this, 'validIds', __default(validIds, null));
		},
		events: {
			VALIDATE: 'validate',
			PURCHASE: 'purchase',
			CANCEL: 'cancel',
		}
	});
});
