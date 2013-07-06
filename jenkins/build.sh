#!/bin/bash -xe

# NOTE: $WORKSPACE is the root of the project git repo

STAGING_AREA="$1"

#force a clean build if indicated
if [ -d $STAGING_AREA/clean.build ]; then
   echo "Performing CLEAN build."
   git clean -fdx
else
   echo "Performing INCREMENTAL build."
fi

#clean old staging area
rm -rf $STAGING_AREA/workspace/spjs
mkdir $STAGING_AREA/workspace/spjs

#clean new staging area
rm -rf $STAGING_AREA/workspace/sdk/osx/package/lib/spaceport-support/js/spaceport.js

#save change documentation to staging area
$SP_SCRIPTS/copy_component_changes.py $WORKSPACE/../builds/$BUILD_NUMBER/changelog.xml $STAGING_AREA/changes/spjs.txt

make spaceport-release.js

#move build artifacts to old staging area
cp $WORKSPACE/spaceport-release.js $STAGING_AREA/workspace/spjs/spaceport.js

#move build artifacts to new staging area
cp $WORKSPACE/spaceport-release.js $STAGING_AREA/workspace/sdk/osx/package/lib/spaceport-support/js/spaceport.js

