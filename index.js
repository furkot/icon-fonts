var fs = require('fs');
var find = require('find');
var path = require('path');
var webfontsGenerator = require('webfonts-generator');

var options = {
  dest: 'build/',
  fontName: 'furkot',
  types: ['eot', 'woff', 'ttf', 'svg'],
  startCodepoint: 0xe000,
  codepoints: {
    'flag': 0xe010,
    'home': 0xe014,
    'close': 0xe006,
    'cloudy': 0xe00e,
    'checkbox-checked': 0xe001,
    'checkbox-unchecked': 0xe00f,
    'new-tab': 0xe020,
    'plus': 0xe02b,
    'tab': 0xe058,
    'warning': 0xe013
  },
  rename: stripPrefix,
  html: true,
  htmlTemplate: './templates/html.hbs',
  cssTemplate: './templates/less.hbs',
  templateOptions: {
    fontsPath: 'fonts/',
    baseClass: 'ff-icon',
    classPrefix: 'ff-icon-',
    alias: {
      '.icon-flag': 'flag',
      '.icon-home': 'home',
      '.icon-close': 'close',
      '.icon-weather': 'cloudy',
      '.icon-checked': 'checkbox-checked',
      '.icon-unchecked':'checkbox-unchecked',
      '.icon-link': 'new-tab',
      '.icon-plus': 'plus',
      '.ff-icon-reverse': 'tab',
      '.fuwr-state-warning': 'warning'
    }
  }
};


function stripPrefix(name) {
  name = path.basename(name, '.svg');
  return /^\d{4}-/.test(name) ? name.slice(5) : name;
}

options.files = find.fileSync(/\.svg$/, 'svg');

webfontsGenerator(options, function(error) {
  if (error) {
    console.log('Fail!', error);
    process.exit(1);
  }
  else {
    console.log('Done!');
  }
});
