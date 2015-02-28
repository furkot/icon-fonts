var path = require('path');
var fs = require('fs');
var to_json = require('xmljson').to_json;
var svgpath = require('svgpath');
var handlebars = require('handlebars')

module.exports = svg2js;

var PIN_WIDTH = 32;
var PIN_HEIGHT = 37;
var MARGIN = 4;
var ICON_SIZE = PIN_WIDTH - 2 * MARGIN;
var ORIG_SIZE = 1000; // 1000 is default icon size in font in our SVG

var RATIO = ICON_SIZE / ORIG_SIZE;

var BASELINE = PIN_HEIGHT - PIN_WIDTH;

function convert(path, originalWidth) {
  return svgpath(path)
    .translate((ORIG_SIZE - originalWidth) / 2, 0)
    .scale(RATIO, -RATIO) // scale *and* flip Y axis
    .translate(MARGIN, PIN_WIDTH - MARGIN)  // move to the center of the pin
    .abs()
    .round(1)
    .toString();
}


function renderJs(ctx) {
  var templatePath = path.resolve(__dirname, '../templates/js.hbs');
  var source = fs.readFileSync(templatePath, 'utf8')
  var template = handlebars.compile(source)
  return template(ctx)
}

function svg2js(from, fn) {

  var to = path.join(path.dirname(from), path.basename(from, '.svg') + '.js');
  console.log('Parsing %s to %s.', from, to);

  function write(err, json) {
    var result = [];

    if (!err) {
      var glyph = json.svg.defs.font.glyph;
      var render;

      glyph = Object.keys(glyph).forEach(function (obj, key) {
        var g = glyph[key].$;
        var index = g.unicode.charCodeAt(0) - 0xe000;
        result[index] = convert(g.d, g['horiz-adv-x']);
      });

      fs.writeFileSync(to, renderJs({
        paths: JSON.stringify(result, null, 2),
        namespace: 'clownfish.map'
      }));
    }
    fn(err);
  }

  var xml = fs.readFileSync(from);
  to_json(xml, write);
}