var fs = require('fs');
var find = require('find');
var path = require('path');
var webfontsGenerator = require('webfonts-generator');

var version = require('./package.json').version;

var options = {
  dest: 'build/',
  fontName: 'furkot',
  types: ['eot', 'woff', 'ttf', 'svg'],
  startCodepoint: 0xe000,
  codepoints: {
    'heart': 0xe051
  },
  rename: stripPrefix,
  html: true,
  htmlTemplate: './templates/html.hbs',
  cssTemplate: './templates/less.hbs',
  templateOptions: {
    version: version,
    fontsPath: 'fonts/',
    baseClass: 'ff-icon',
    classPrefix: 'ff-icon-',
    alias: {
      '.auth-icon-facebook': 'facebook-2',
      '.auth-icon-foursquare': 'foursquare',
      '.auth-icon-google': 'google-plus-2',
      '.auth-icon-tripit': 'tripit',
      '.auth-icon-twitter': 'twitter',
      '.ff-icon-reverse': 'tab',
      '.fuwr-state-warning': 'warning',
      '.icon-back': 'arrow-left',
      '.icon-checked': 'checkbox-checked',
      '.icon-close': 'close',
      '.icon-flag': 'flag',
      '.icon-home': 'home',
      '.icon-link': 'new-tab',
      '.icon-plus': 'plus',
      '.icon-unchecked':'checkbox-unchecked',
      '.icon-weather': 'cloudy'
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
