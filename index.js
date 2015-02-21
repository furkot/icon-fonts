var argv = require('minimist')(process.argv.slice(2));
var descriptors = argv._;
var generate = require('./lib/generate');
var version = require('./package.json').version;
var path = require('path');


if (descriptors.length < 1) {
  console.error('Usage: ', process.argv.slice(0, 2).join(' '), 'font.json [, another-font.json]');
  process.exit(1);
}

descriptors.forEach(function(d) {
  var filename = path.resolve(__dirname, d),
    dirname = path.dirname(filename),
    basename = path.basename(filename, '.json'),
    descriptor = require(filename);

  descriptor.svgPath = path.resolve(dirname, descriptor.svgPath);
  generate(basename, version, descriptor);
});
