# Spaceport JavaScript

## Directory structure

`build/` - build scripts.

`spaceport/` - Spaceport library files.

`spaceport-shared/` - modules shared between various JavaScript projects.

`spaceport-html5/` - Spaceport HTML5 renderer files.

## Build targets

### Committed targets

These targets are staged when executing `make commit`.  If there is a merge
conflict with any of these files, simply `make commit` to rebuild.

`spaceport.js` - copy of `spaceport-internal-debug.js`.

`spaceport-html5.js` - copy of `spaceport-html5-internal-debug.js`.

### Target patterns

The remaining build targets follow a pattern.

#### Project

The first half of the target filename indicates which project the target is a
part of.

`spaceport-*.js` - Spaceport library.  (Depends on a renderer.)

`spaceport-html5-*.js` - Spaceport HTML5 renderer.

#### Flags

The second half of the target filename indicates whether or not the source is
minified and if debugging flags are set.

`*-internal-debug.js` - built for internal debugging.  `CUSTOMER_DEBUG` and
`DEBUG` flags set; unminified.

`*-release-debug.js` - built for external debugging.  `DEBUG` flag set;
minified.

`*-release.js` - built for external release.  No debugging flags set; minified.
