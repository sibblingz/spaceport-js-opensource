# See README.md for details on build targets

.PHONY: all local clean test

# Directories
ROOT := $(PWD)
BUILD_TOOLS := $(ROOT)/build

# Inputs
UGLIFYJS_BIN := $(BUILD_TOOLS)/strager-UglifyJS-e196857/bin/uglifyjs

ALL_BUILD_FILES := $(ROOT)/Makefile $(BUILD_TOOLS)/build.sh $(BUILD_TOOLS)/google-closure-compiler.jar $(UGLIFYJS_BIN)
SPACEPORT_BUILD_FILES := $(ALL_BUILD_FILES) $(BUILD_TOOLS)/spaceport.sh $(BUILD_TOOLS)/constant_folder.js $(BUILD_TOOLS)/derequire.js
HTML5_BUILD_FILES := $(ALL_BUILD_FILES) $(BUILD_TOOLS)/html5.sh $(BUILD_TOOLS)/derequire.js

FLASH_DOMAIN_JS_FILE := $(ROOT)/spaceport/domain/flashDomain.js

SHARED_JS_FILES := $(shell find "$(ROOT)/spaceport-shared" -name '*.js')
SPACEPORT_JS_FILES := $(ROOT)/spaceport-dev.js $(SHARED_JS_FILES) $(shell find "$(ROOT)/spaceport" -name '*.js') $(FLASH_DOMAIN_JS_FILE)
HTML5_JS_FILES := $(ROOT)/spaceport-html5-dev.js $(SHARED_JS_FILES) $(shell find "$(ROOT)/spaceport-html5" -name '*.js')

# ------------------------------------------------------------------------------

all: spaceport-internal-debug.js spaceport-release.js spaceport-release-debug.js spaceport-html5-internal-debug.js spaceport-html5-release.js

clean:
	@rm -f -- \
		$(ROOT)/spaceport-internal-debug.js \
		$(ROOT)/spaceport-release.js \
		$(ROOT)/spaceport-release-debug.js \
		$(ROOT)/spaceport-html5-internal-debug.js \
		$(ROOT)/spaceport-html5-release.js

local: spaceport.js spaceport-html5.js
	node spaceport.js

test: spaceport.js
	sptest test nodejs headless

# ------------------------------------------------------------------------------

$(UGLIFYJS_BIN):
	(cd $(BUILD_TOOLS) && curl -L 'https://github.com/strager/UglifyJS/tarball/e19685710c99547c5b1e32b9ab1ffbffbf82c8f4' | tar -xz)

# ------------------------------------------------------------------------------

spaceport.js: spaceport-internal-debug.js
	cp $^ $@

spaceport-internal-debug.js: $(SPACEPORT_BUILD_FILES) $(SPACEPORT_JS_FILES)
	"$(BUILD_TOOLS)/spaceport.sh" -q -d -D -o "$@"

spaceport-release-debug.js: $(SPACEPORT_BUILD_FILES) $(SPACEPORT_JS_FILES)
	"$(BUILD_TOOLS)/spaceport.sh" -q -D -m -z 4096 -o "$@"

spaceport-release.js: $(SPACEPORT_BUILD_FILES) $(SPACEPORT_JS_FILES)
	"$(BUILD_TOOLS)/spaceport.sh" -q -m -z 4096 -o "$@"

$(FLASH_DOMAIN_JS_FILE): $(shell find "$(ROOT)/spaceport/flash" -name '*.js') $(BUILD_TOOLS)/domain.sh
	"$(BUILD_TOOLS)/domain.sh" "$(ROOT)/spaceport" "flash" "domain/flashDomain.js"

# ------------------------------------------------------------------------------

spaceport-html5.js: spaceport-html5-internal-debug.js
	cp $^ $@

spaceport-html5-internal-debug.js: $(HTML5_BUILD_FILES) $(HTML5_JS_FILES)
	"$(BUILD_TOOLS)/html5.sh" -q -d -D -o "$@"

spaceport-html5-release.js: $(HTML5_BUILD_FILES) $(HTML5_JS_FILES)
	"$(BUILD_TOOLS)/html5.sh" -q -m -z 4096 -o "$@"
