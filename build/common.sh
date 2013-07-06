#!/bin/bash

# objectMutator property names
function rename_objectMutator {
	rename patchObjectPropertiesReadOnly e
	rename patchObjectProperties f
	rename patch g ! -name PluginCreator.js # Flaky
	rename lookupType h
	rename build i ! -name PluginCreator.js
}

# ProxyClass builder names
function rename_ProxyClass {
	rename references r ! -name PluginCreator.js
	rename alwaysShadow j ! -name PluginCreator.js
	rename real k ! -name PluginCreator.js
	rename fake l ! -name PluginCreator.js
	rename shadow m

	# Shared ProxyClass/Class builder names
	# Class is public, so don't rename
	rename properties n ! -name PluginCreator.js ! -name Class.js
	# TODO Make these conditions less inelegant
	rename methods o ! -name PluginCreator.js ! -name Class.js -and ! -name 'Domain.js' -and ! -name 'AggregateDomain.js'

	rename 'constructor' 'c' -name 'PurchaseEvent.js'
	rename 'config\.constructor' 'config.c' -name 'create.js'
	rename 'constructor' 'c' -path '*/events/*.js' -or -name 'eventBuilder.js'

	# FUCK YOU BASH
	find "$BUILD_DIR/flash" -path '*/*.js' -exec \
		sed -i -e "s/constructor\:/c:/g" {} \+
}

# Event builder names
function rename_builders {
	rename_unsafe 'events\:' 'e:' -name 'PurchaseEvent.js'
	rename_unsafe 'events\:' 'e:' -path '*/events/*.js'
	rename_unsafe '\.events' '.e' -name 'eventBuilder.js' -or -name 'PluginCreator.js' ! -name PluginCreator.js

	rename_unsafe 'args\:' 'a:' -name 'PurchaseEvent.js'
	rename_unsafe 'args\:' 'a:' -path '*/events/*.js'
	rename_unsafe '\.args' '.a' -name 'eventBuilder.js' -or -name 'Event.js' -or -name 'PluginCreator.js' ! -name PluginCreator.js
}

# Domain names
function rename_Domain {
	rename getAllFQNs a
	rename getClass b
	rename getAllClassesCopy c
	rename getClassInfo d
	rename getPackage e
	rename getFQNOfClass f

	rename addDomain g
	rename removeDomain h
}
