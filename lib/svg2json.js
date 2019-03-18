const path = require('path');
const fs = require('fs');
const { to_json } = require('xmljson');
const svg2sprite = require('./svg2sprite');
const { convert } = require('./util');

module.exports = svg2js;

var PIN_WIDTH = 26;
var MARGIN = 4;
var ICON_SIZE = PIN_WIDTH - 2 * MARGIN;

function svg2js(from, templateOptions, fn) {

  let { paths, iconDim } = templateOptions;

  const to = path.join(path.dirname(from), path.basename(from, '.svg') + '.json');
  console.log('Parsing %s to %s.', from, to);

  paths = (paths || []).reduce(function (result, path) {
    if (path) {
      path = path.split(':')[0];
      if (path) {
        result.paths[path] = true;
        result.icons.push(path);
      }
    }
    return result;
  }, {
    paths: {},
    icons: []
  });

  if (paths.icons.length) {
    fs.writeFileSync(path.join(path.dirname(from), path.basename(from, '.svg') + '-icons.json'),
        JSON.stringify(paths.icons, null, 2));
  }
  paths = paths.paths;

  function write(err, json) {
    var result = {};

    if (!err) {
      var glyph = json.svg.defs.font.glyph;

      glyph = Object.keys(glyph).reduce(function (glyphResult, obj, key) {
        var g = glyph[key].$;
        var width = g['horiz-adv-x'];
        var name = g['glyph-name'];
        if (name && paths[name]) {
          result[name] = convert(g.d, width, iconDim, ICON_SIZE, MARGIN);
          if (width > iconDim + 1) {
            console.error('Glyph too wide:', g['glyph-name'], width);
          }
          glyphResult[name] = {
              path: g.d,
              width
          };
        }
        return glyphResult;
      }, {});

      fs.writeFileSync(to, JSON.stringify(result, null, 2));

      return svg2sprite(path.dirname(from), glyph, templateOptions, fn);
    }
    fn(err);
  }

  var xml = fs.readFileSync(from);
  to_json(xml, write);
}