var find = require('find');
var path = require('path');
var webfontsGenerator = require('webfonts-generator');
var merge = require('lodash').merge;
var svg2js = require('./svg2js');

module.exports = generate;

var defaults = {
  dest: 'build/',
  types: ['woff', 'ttf', 'svg'],
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
  options.files = find.fileSync(/\.svg$/, options.svgPath);

  webfontsGenerator(options, function(err) {
    exitOnError(err);
    svg2js(options.dest + options.fontName + '.svg', options.templateOptions.paths, function(err) {
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
