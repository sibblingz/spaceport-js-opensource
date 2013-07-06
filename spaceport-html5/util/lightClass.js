define('util/lightClass', [
	'shared/translateGetSet',
	'shared/apply'
], function(
	translateGetSet,
	apply
) {
    // TODO Make this shared (sp.Point et al want it)

    // This is designed for performance (unlike sp.Class, which is designed for
    // convenience).

    function nameFunction(name, f) {
        // DEBUG
        return (eval('(function(f){return function '+name+'(){return f.apply(this,arguments);}})'))(f);
    }

    function __inherit(to, from, extend) {
        function Mock() { }
        Mock.prototype = from.prototype;
        to.prototype = apply(new Mock(), extend);
        return to;
    }

    function lightClass(superclass, prototype) {
        if(arguments.length === 1) {
            prototype = superclass;
            superclass = Object;
        } else if(arguments.length === 0) {
            prototype = { };
            superclass = Object;
        }

        function klassCtor() {
            // TODO Kill this
            superclass.apply(this, arguments);

            if(prototype.constructor) {
                prototype.constructor.apply(this, arguments);
            }
        }

        var Klass;
        if (prototype.constructor) {
            // DEBUG
            Klass = nameFunction(prototype.constructor.name, klassCtor);
        } else {
            Klass = klassCtor;
        }

        return __inherit(Klass, superclass, translateGetSet(prototype));
    }

    return lightClass;
});
