define('display/Frame', [
	'display/DisplayListContainer',
	'util/lightClass',
	'util/cloneInstance'
], function(
	DisplayListContainer,
	lightClass,
	cloneInstance
) {
	var Frame = lightClass({
		constructor: function Frame(children, childSlotNumbers, label, actions, script) {
			this.children = children.slice();
			this.label = label;
			this.actions = actions.slice();
			this.script = script;
			this.childSlotNumbers = childSlotNumbers.map(Number);
		}
	});

	return Frame;
});
