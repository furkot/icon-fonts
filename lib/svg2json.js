var path = require('path');
var fs = require('fs');
var to_json = require('xmljson').to_json;
var svgpath = require('svgpath');

module.exports = svg2js;

var PIN_WIDTH = 26;
var MARGIN = 4;
var ICON_SIZE = PIN_WIDTH - 2 * MARGIN;
var ORIG_SIZE = 1000; // 1000 is default icon size in font in our SVG

var RATIO = ICON_SIZE / ORIG_SIZE;

function convert(path, originalWidth) {
  return svgpath(path)
    .translate((ORIG_SIZE - originalWidth) / 2, 0)
    .scale(RATIO, -RATIO) // scale *and* flip Y axis
    .translate(MARGIN, PIN_WIDTH - MARGIN)  // move to the center of the pin
    .abs()
    .round(1)
    .toString();
}

function svg2js(from, paths, fn) {

  var to = path.join(path.dirname(from), path.basename(from, '.svg') + '.json');
  console.log('Parsing %s to %s.', from, to);

  paths = (paths || []).reduce(function (result, path) {
    if (path) {
      result[path] = true;
    }
    return result;
  }, {});

  function write(err, json) {
    var result = {};

    if (!err) {
      var glyph = json.svg.defs.font.glyph;

      glyph = Object.keys(glyph).forEach(function (obj, key) {
        var g = glyph[key].$;
        var width = g['horiz-adv-x'];
        var name = g['glyph-name'];
        if (name && paths[name]) {
          result[name] = convert(g.d, width);
          if (width > 1001) {
            console.error('Glyph too wide:', g['glyph-name'], width);
          }
        }
      });

      fs.writeFileSync(to, JSON.stringify(result, null, 2));
    }
    fn(err);
  }

  var xml = fs.readFileSync(from);
  to_json(xml, write);
}