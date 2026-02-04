const path = require('node:path');
const webfontsGenerator = require('@furkot/webfonts-generator');
const merge = require('lodash').merge;
const { findFiles } = require('./util.js');
const svg2json = require('./svg2json.js');
const svg2sprite = require('./svg2sprite/index.js');
const handlebars = require('handlebars');
const stylesheets = require('./stylesheets.js');

module.exports = generate;

const defaults = {
  dest: 'build/',
  types: ['woff', 'woff2', 'svg'],
  startCodepoint: 0xe000,
  rename: stripPrefix,
  html: true,
  htmlTemplate: 'templates/html.hbs',
  cssTemplate: 'templates/less.hbs'
};

async function generate(name, version, descriptor) {
  const options = merge(descriptor, defaults, {
    fontName: name,
    templateOptions: {
      version
    }
  });

  const stopPaths = (options.templateOptions.paths || []).reduce((result, path) => {
    if (path) {
      path = path.split(':')[0];
      if (path) {
        result[path] = 'stop-path';
      }
    }
    return result;
  }, {});

  handlebars.registerHelper('stopPathClass', name => stopPaths[name]);

  parseHexValues(options.codepoints);
  options.files = (await findFiles(/\.svg$/, options.svgPath)).sort((a, b) => {
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

  await webfontsGenerator(options);

  const { dest, fontName, templateOptions, svgPath } = options;
  templateOptions.dirname = path.dirname(descriptor.filename);
  const filename = `${dest + fontName}.svg`;
  await Promise.all([
    svg2json(filename, templateOptions),
    svg2sprite(dest, { ...templateOptions, svgPath }),
    stylesheets(filename, templateOptions)
  ]);
  console.log('Done!');
}

function parseHexValues(obj) {
  Object.keys(obj).forEach(key => {
    obj[key] = Number.parseInt(obj[key], 16);
  });
}

function stripPrefix(name) {
  name = path.basename(name, '.svg');
  return /^\d{4}-/.test(name) ? name.slice(5) : name;
}
