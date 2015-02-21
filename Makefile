NODE_BIN = ./node_modules/.bin
FONT = furkot


FONT_TYPES = svg eot woff ttf
FONT_FILES = $(patsubst %, build/fonts/$(FONT).%,$(FONT_TYPES))

SVG_FILES = $(shell find svg -name '*.svg')

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

build: build/fonts $(FONT_FILES) build/$(FONT).less build/$(FONT).html

demo: build
	$(NODE_BIN)/lessc build/$(FONT).less build/$(FONT).css
	xdg-open build/$(FONT).html

deploy:
	cp $(FONT_FILES) $(FURKOT_PROJECT_DIR)/client/root/res/fonts
	cp build/$(FONT).less $(FURKOT_PROJECT_DIR)/client/root/style/font-$(FONT).less

.PHONY: check clean build all
