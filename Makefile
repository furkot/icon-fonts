NODE_BIN = ./node_modules/.bin

all: check build

check:
	$(NODE_BIN)/jshint index.js

clean:
	rm -rf build/*

build:
	node index.js

.PHONY: check clean build all