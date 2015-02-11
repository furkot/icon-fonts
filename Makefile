all: check build

check:
	echo 'Testing...'

clean:
	rm -rf build

build:
	mkdir build
	node index.js

.PHONY: check clean build all