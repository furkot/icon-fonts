NODE_BIN = ./node_modules/.bin
FONT = furkot

FONT_TYPES = woff woff2
FONT_INTERMEDIATE_FILES = $(patsubst %, build/$(FONT).%, $(FONT_TYPES))
FONT_FILES = $(patsubst %, build/fonts/$(FONT).%, $(FONT_TYPES))

SVG_FILES = $(shell find svg/$(FONT) -name '*.svg')
LICENSE_FILES = $(shell find svg/$(FONT) -name 'License.md')

LICENSE=build/icon-license.md
LICENSE_HTML=build/icon-license.html

all: check build

check: lint test

lint:
	$(NODE_BIN)/jshint index.js lib

test:
	node --test

clean:
	rm -rf build

.PHONY: all check lint test

build/fonts build/sprite:
	mkdir -p $@

build/fonts/%: build/%
	mv $< $@

$(FONT_INTERMEDIATE_FILES) build/$(FONT).less build/$(FONT).html: build.intermediate

.SECONDARY: $(FONT_INTERMEDIATE_FILES)
.INTERMEDIATE: build.intermediate

build.intermediate: index.js $(SVG_FILES) $(FONT).json | build/fonts build/sprite
	node index.js $(FONT).json
	mv build/$(FONT).css build/$(FONT).less

$(LICENSE): $(LICENSE_FILES)
	awk 'FNR==1{print ""}1' $^ > $@

build: $(FONT_FILES) build/$(FONT).less build/$(FONT).html

demo: build
	$(NODE_BIN)/lessc build/$(FONT).less build/$(FONT).css
	xdg-open build/$(FONT).html

deploy: $(LICENSE)
	$(NODE_BIN)/marked -o $(LICENSE_HTML) < $(LICENSE)

optimize:
	node lib/optimize.js svg/furkot ../$(FONT).json
	node lib/optimize.js --no-rescale svg/sprite/sprite-streets

%.svg.pk: %.svg
	svgcleaner $< $<

pack: $(SVG_FILES:%.svg=%.svg.pk)

verify:
	node lib/verify.js svg/furkot ../$(FONT).json

.PHONY: clean build demo deploy optimize pack verify
