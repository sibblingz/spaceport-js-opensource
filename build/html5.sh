#!/bin/bash

BUILD_TOOLS="$(cd "$(dirname "$0")" && pwd)"
ROOT="$BUILD_TOOLS/.."

function build_pre {
	# Pre-build steps
	cp -R -L "$ROOT/spaceport-html5/"* "$BUILD_DIR"

	# TODO Selective renames (buildIntoElement, etc.)
}

function build_entry {
	NAMES='Math, Number, String, document, SVGElement, SVGSVGElement, SVGUseElement, SVGTextElement, SVGGradientElement, SVGDefsElement'

	# Cut out Android Spaceport
	echo "if (typeof navigator !== 'undefined' && navigator.userAgent !== 'FakeWebView') {"

	echo " (function ($NAMES) {"

	node "$BUILD_TOOLS/derequire.js" "$BUILD_DIR/" "$BUILD_DIR/main.js" |
		replace_constants

	echo
	echo " }($NAMES));"

	echo "}"
}

function build_release_pre {
	if $MINIFY; then
		minify
	else
		cat
	fi
}

source "$BUILD_TOOLS/build.sh"
