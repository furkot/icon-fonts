var find = require('find');
var path = require('path');
var webfontsGenerator = require('webfonts-generator');
var merge = require('lodash').merge;

module.exports = generate;

var defaults = {
  dest: 'build/',
  types: ['eot', 'woff', 'ttf', 'svg'],
  startCodepoint: 0xe000,
  rename: stripPrefix,
  html: true,
  htmlTemplate: 'templates/html.hbs',
  cssTemplate: 'templates/less.hbs',
};


function generate(name, version, descriptor) {
  var options = merge(descriptor, defaults, {
    fontName: name,
    templateOptions: {
      version: version
    }
  });

  parseHexValues(options.codepoints);
  options.files = find.fileSync(/\.svg$/, options.svgPath);

  webfontsGenerator(options, function(error) {
    if (error) {
      console.log('Fail!', error);
      process.exit(1);
    }
    else {
      console.log('Done!');
    }
  });
}


function parseHexValues(obj) {
  Object.keys(obj).forEach(function(key) {
    obj[key] = parseInt(obj[key], 16);
  });
}

function stripPrefix(name) {
  name = path.basename(name, '.svg');
  return /^\d{4}-/.test(name) ? name.slice(5) : name;
}
