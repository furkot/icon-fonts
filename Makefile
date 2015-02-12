NODE_BIN = ./node_modules/.bin
FONT = furkot


all: check build

check:
	$(NODE_BIN)/jshint index.js

clean:
	rm -rf build/*

build:
	node index.js
	mv build/$(FONT).css build/$(FONT).less

demo:
	$(NODE_BIN)/lessc build/$(FONT).less build/$(FONT).css
	xdg-open build/$(FONT).html

.PHONY: check clean build all