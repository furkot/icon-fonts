const path = require('node:path');
const fs = require('node:fs/promises');
const { promisify } = require('node:util');

const { to_json } = require('xmljson');
const { convert } = require('./util');

const xml2json = promisify(to_json);

module.exports = svg2js;

const PIN_WIDTH = 26;
const MARGIN = 4;
const ICON_SIZE = PIN_WIDTH - 2 * MARGIN;

async function svg2js(from, { paths, iconDim }) {
  const to = path.join(path.dirname(from), `${path.basename(from, '.svg')}.json`);
  console.log('Parsing %s to %s.', from, to);

  paths = (paths || []).reduce((result, path) => {
    if (path) {
      const [name, sprite] = path.split(':');
      path = name;
      if (path) {
        result.paths[path] = true;
        result.icons.push(path);
        if (sprite) {
          sprite.split(',').forEach(sprite => {
            if (sprite !== path) {
              result.sprites[sprite] = path;
            }
          });
        }
      }
    }
    if (!path) {
      result.icons.push('');
    }
    return result;
  }, {
    paths: {},
    sprites: {},
    icons: []
  });

  if (paths.icons.length) {
    const prefix = path.join(path.dirname(from), `${path.basename(from, '.svg')}`);
    await Promise.all([
      fs.writeFile(`${prefix}-icons.json`, JSON.stringify(paths.icons, null, 2)),
      fs.writeFile(`${prefix}-sprites.json`, JSON.stringify(paths.sprites, null, 2))
    ]);
  }
  paths = paths.paths;

  const xml = await fs.readFile(from);
  const json = await xml2json(xml);

  const result = {};
  Object.entries(json.svg.defs.font.glyph).forEach(([key, value]) => {
    const g = value.$;
    const width = g['horiz-adv-x'];
    const name = g['glyph-name'];
    if (name && paths[name]) {
      result[name] = convert(g.d, width, iconDim, ICON_SIZE, MARGIN);
      if (width > iconDim + 1) {
        console.error('Glyph too wide:', g['glyph-name'], width);
      }
    }
  });

  await fs.writeFile(to, JSON.stringify(result, null, 2));
}
