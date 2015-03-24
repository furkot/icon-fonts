NODE_BIN = ./node_modules/.bin
FONT = furkot


FONT_TYPES = svg eot woff ttf
FONT_FILES = $(patsubst %, build/fonts/$(FONT).%,$(FONT_TYPES))

SVG_FILES = $(shell find svg/$(FONT) -name '*.svg')
LICENSE_FILES = $(shell find svg/$(FONT) -name 'License.md')

LICENSE=build/icon-license.md

all: check build

check:
	$(NODE_BIN)/jshint index.js lib

clean:
	rm -rf build

build/fonts:
	mkdir -p $@

build/fonts/%: build/%
	mv $< $@

build/$(FONT).%: index.js $(SVG_FILES)
	node index.js $(FONT).json
	mv build/$(FONT).css build/$(FONT).less

$(LICENSE): $(LICENSE_FILES)
	awk 'FNR==1{print ""}1' $^ > $@

build: build/fonts $(FONT_FILES) build/$(FONT).less build/$(FONT).html

demo: build
	$(NODE_BIN)/lessc build/$(FONT).less build/$(FONT).css
	xdg-open build/$(FONT).html

deploy: $(LICENSE)
	cp $(FONT_FILES) $(FURKOT_PROJECT_DIR)/client/root/res/fonts
	cp build/$(FONT).less $(FURKOT_PROJECT_DIR)/client/root/style/font-$(FONT).less
	cp build/$(FONT).js $(FURKOT_PROJECT_DIR)/client/src/map/paths.js
	cp $(LICENSE) $(FURKOT_PROJECT_DIR)/node/views/components

optimize:
	node lib/optimize.js svg

verify:
	node lib/verify.js svg

.PHONY: check clean build all demo deploy optimize verify
