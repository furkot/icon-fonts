const descriptors = process.argv.slice(2);
const generate = require('./lib/generate');
const version = require('./package.json').version;
const path = require('path');


if (descriptors.length < 1) {
  console.error('Usage: ', process.argv.slice(0, 2).join(' '), 'font.json [, another-font.json]');
  process.exit(1);
}

descriptors.forEach(d => {
  const filename = path.resolve(__dirname, d);
  const dirname = path.dirname(filename);
  const basename = path.basename(filename, '.json');
  const descriptor = require(filename);

  descriptor.filename = filename;
  descriptor.svgPath = path.resolve(dirname, descriptor.svgPath);
  generate(basename, version, descriptor).catch(error => {
    console.log('Fail!', error);
    process.exit(1);
  });
});
