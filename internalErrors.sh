#!/bin/sh

DIR="$(cd "$(dirname "$0")" && pwd)"

(
	# Collect error messages
	find "$DIR/spaceport" "$DIR/spaceport-html5" "$DIR/spaceport-shared" -name '*.js' -exec \
		grep -n -r 'internalError(' -- {} \+ |
		grep -v 'function internalError'
) | (
	# Magical sed formatting
	sed -e 's/:\s*internalError(\([0-9]\+\)/:\1:internalError(\1/' |
		sed -e "s'^$DIR/''" # HACK FIXME
) | (
	# Pretty it up so humans can read
	awk -F: '{ printf("%d&%s&%s\n", $3, $1 " " $2, $4) }' |
		sort -n |
		column -t -s'&'
)
