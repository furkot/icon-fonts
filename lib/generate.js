var find = require('find');
var path = require('path');
var webfontsGenerator = require('@darthsoup/webfonts-generator');
var merge = require('lodash').merge;
var svg2json = require('./svg2json');

module.exports = generate;

var defaults = {
  dest: 'build/',
  types: ['woff', 'woff2', 'svg'],
  startCodepoint: 0xe000,
  rename: stripPrefix,
  html: true,
  htmlTemplate: 'templates/html.hbs',
  cssTemplate: 'templates/less.hbs',
};

function exitOnError(error) {
  if (error) {
    console.log('Fail!', error);
    process.exit(1);
  }
}

function generate(name, version, descriptor) {
  var options = merge(descriptor, defaults, {
    fontName: name,
    templateOptions: {
      version: version
    }
  });

  parseHexValues(options.codepoints);
  options.files = find.fileSync(/\.svg$/, options.svgPath).sort((a, b) => {
    a = a.split('/').pop();
    b = b.split('/').pop();
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });

  webfontsGenerator(options, function(err) {
    exitOnError(err);
    const { dest, fontName, templateOptions } = options;
    templateOptions.dirname = path.dirname(descriptor.filename);
    svg2json(dest + fontName + '.svg', templateOptions, (err) => {
      exitOnError(err);
      console.log('Done!');
    });
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
