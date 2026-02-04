const path = require('node:path');
const fs = require('node:fs/promises');
const { convert, xml2json } = require('./util.js');

module.exports = svg2js;

const PIN_WIDTH = 26;
const MARGIN = 4;
const ICON_SIZE = PIN_WIDTH - 2 * MARGIN;

async function svg2js(from, { paths = [], iconDim, sprite }) {
  const to = path.join(path.dirname(from), `${path.basename(from, '.svg')}.json`);
  console.log('Parsing %s to %s.', from, to);

  if (paths.length) {
    const prefix = path.join(path.dirname(from), `${path.basename(from, '.svg')}`);
    const files = [fs.writeFile(`${prefix}-icons.json`, JSON.stringify(paths, null, 2))];
    sprite.forEach(({ name, prefix, svgSourceFiles }) => {
      if (svgSourceFiles) {
        const spritesMap = Object.fromEntries(Object.entries(svgSourceFiles).filter(([from, to]) => from !== to));
        prefix = path.join(path.dirname(from), prefix || name);
        files.push(fs.writeFile(`${prefix}-sprites.json`, JSON.stringify(spritesMap, null, 2)));
      }
    });
    await Promise.all(files);
  }
  paths = paths.reduce((result, p) => {
    result[p] = true;
    return result;
  }, Object.create(null));

  const xml = await fs.readFile(from);
  const json = await xml2json(xml);

  const result = {};
  Object.entries(json.svg.defs[0].font[0].glyph).forEach(([_key, value]) => {
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
