#!/bin/sh

FROM_NAME=${1%.js}
TO_NAME=${2%.js}

mkdir -p "$(dirname "$TO_NAME.js")"
git mv "$FROM_NAME.js" "$TO_NAME.js"
find -L -name '*.js' -exec sed -i -e "1s_'$FROM_NAME'_'$TO_NAME'_" {} \;
