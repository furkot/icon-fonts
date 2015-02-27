var path = require('path');
var fs = require('fs');
var to_json = require('xmljson').to_json;
var svgpath = require('svgpath');

module.exports = svg2js;

var PIN_WIDTH = 40;
var PIN_HEIGHT = 48;
var ICON_SIZE = 32;

var RATIO = ICON_SIZE / 1000; // 1000 is default icon size in font SVG

var MARGIN = (PIN_WIDTH - ICON_SIZE) / 2;
var BASELINE = PIN_HEIGHT - PIN_WIDTH;

function convert(path) {
  return svgpath(path)
    .scale(RATIO, -RATIO) // scale *and* flip Y axis
    .translate(MARGIN, PIN_WIDTH - MARGIN)  // move to the center of the pin
    .abs()
    .round(1)
    .toString();
}

function svg2js(from, fn) {

  var to = path.join(path.dirname(from), path.basename(from, '.svg') + '.js');
  console.log('Parsing %s to %s.', from, to);



  function write(err, json) {
    var result = [];

    if (!err) {
      var glyph = json.svg.defs.font.glyph;

      glyph = Object.keys(glyph).forEach(function (obj, key) {
        var g = glyph[key].$;
        var index = g.unicode.charCodeAt(0) - 0xe000;
        result[index] = convert(g.d);
      });

      fs.writeFileSync(to, JSON.stringify(result, null, 2));
    }
    fn(err);
  }

  var xml = fs.readFileSync(from);
  to_json(xml, write);
}