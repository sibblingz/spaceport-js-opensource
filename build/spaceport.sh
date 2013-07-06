#!/bin/bash

BUILD_TOOLS="$(cd "$(dirname "$0")" && pwd)"
ROOT="$BUILD_TOOLS/.."

function build_pre {
	# Pre-build steps
	cp -R -L "$ROOT/spaceport/"* "$BUILD_DIR"

	# See common.sh
	rename_objectMutator
	rename_ProxyClass
	rename_builders
	rename_Domain

	# Other anon properties
	rename capture p
	#rename normalize q
}

function build_entry {
	# Spaceport major
	NAMES='Math, Number, String, Boolean, Object'

	echo "(function ($NAMES) {"

	if $DEBUG; then
		DEBUG_VAL=true
	else
		DEBUG_VAL=false
	fi

	node "$BUILD_TOOLS/derequire.js" "$BUILD_DIR/" "$BUILD_DIR/nodecompat.js" "$BUILD_DIR/ascompat.js" "$BUILD_DIR/main.js" |
		replace_constants

	echo
	echo "}($NAMES));"
}

function build_release_pre {
	if $MINIFY; then
		# Fold constants (since neither closure or uglify will do it right)
		node "$BUILD_TOOLS/constant_folder.js" |
			# Actual minification
			minify |
			# Inject Spaceport signature
			uglify -ns -nm --inject-comment ' S I B B L I N G Z '
	else
		cat
	fi
}

source "$BUILD_TOOLS/common.sh"
source "$BUILD_TOOLS/build.sh"
