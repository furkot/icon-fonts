const find = require('find');
const fs = require('fs');
const path = require('path');
const spritezero = require('@mapbox/spritezero');
const { convert } = require('./util');
const { xml } = require('el-component');
const { to_json } = require('xmljson');

module.exports = svg2sprite;

function envelope(layers, width, height) {
  layers = layers.map((o) => xml('path', o)).join('');

  return xml('svg', layers, {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: [0, 0, width, height].join(' ')
  });
}

async function resolveBackdrop(dirname, name, backdrop) {
  const filename = path.resolve(dirname, name + '.svg');
  const data = await fs.promises.readFile(filename, 'utf-8');
  return new Promise(resolve => {
    to_json(data, (err, json) => {
      const viewBox = json.svg.$.viewBox.split(' ');
      backdrop.path = json.svg.path.$.d;
      backdrop.ratio = viewBox[3] / viewBox[2];
      resolve();
    });
  });
}

function initBackdrop(backdrops, backdrop, defaultBackdrop) {
  if (backdrop) {
    backdrop.forEach((backdrop, i) => {
      if (defaultBackdrop && defaultBackdrop[i]) {
        Object.assign(backdrop, Object.assign(Object.assign({}, defaultBackdrop[i]), backdrop));
      }
      const { name } = backdrop;
      if (name) {
        backdrops[name] = backdrops[name] || {};
      }
    });
  }
}

async function svg2spriteImpl(toDir, glyph, { dirname, iconDim,  paths, sprite, svgSpritePath }) {
  svgSpritePath = path.resolve(dirname, svgSpritePath);
  await Promise.all(sprite.map(async ({ iconGroups, name, pixelRatio, pattern, size }) => {
    const backdrops = {};
    const defaultPattern = pattern || {};
    initBackdrop(backdrops, defaultPattern.backdrop);
    const iconPatterns = {};
    iconGroups.forEach(({ icons, pattern }) => {
      pattern = Object.assign(Object.assign({}, defaultPattern), pattern);
      initBackdrop(backdrops, pattern.backdrop, defaultPattern.backdrop);
      icons.forEach((icon) => {
        iconPatterns[icon] = pattern;
      });
    });
    await Promise.all(Object.keys(backdrops).map(async key => resolveBackdrop(svgSpritePath, key, backdrops[key])));
    pixelRatio.forEach((pixelRatio) => {
      const imgs = [];
      paths.forEach(path => {
        path = path.split(':');
        if (path.length == 2 && path[0] && path[1]) {
          size.forEach(size => {
            let [ svg, id ] = path;
            let { backdrop, fill, margin } = iconPatterns[id] || pattern;
            if (!fill) {
              fill = pattern.fill;
            }
            if (margin === undefined) {
              margin = pattern.margin || 0;
            }
            const layers = [];
            const width = size + 2 * margin;
            let ratio = 1;
            if (backdrop) {
              backdrop.forEach(backdrop => {
                const bd = backdrops[backdrop.name];
                if (bd.ratio > ratio) {
                  ratio = bd.ratio;
                }
                layers.push({
                  d: convert(bd.path, backdrop.width || iconDim, iconDim, width, 0, true),
                  fill: backdrop.fill
                });
              });
            }
            layers.push({
              d: convert(glyph[svg].path, glyph[svg].width, iconDim, size - margin, 1.5 * margin),
              fill
            });
            svg = Buffer.from(envelope(layers, width, width * ratio));
            id = [ id, size ].join('_');
            imgs.push({
              svg,
              id
            });
          });
        }
      });

      find.fileSync(/\.svg$/, path.join(svgSpritePath, name)).forEach(f => {
        const basename = path.basename(f);
        if (!backdrops[basename]) {
          imgs.push({
            svg: fs.readFileSync(f),
            id: basename.replace('.svg', '')
          });
        }
      });
      
      const basename = pixelRatio === 1 ? name : name + '@' + pixelRatio + 'x';
      const pngName = path.join('sprite', basename + '.png');
      const pngPath = path.join(toDir, pngName);
      const jsonName = path.join('sprite', basename + '.json');
      const jsonPath = path.join(toDir, jsonName);

      // Pass `true` in the layout parameter to generate a data layout
      // suitable for exporting to a JSON sprite manifest file.
      spritezero.generateLayout({
        imgs,
        pixelRatio,
        format: true
      }, (err, dataLayout) => {
        if (err) {
          throw err;
        }
        const spriteJson = {};
        Object.keys(dataLayout).sort().forEach(key => spriteJson[key] = dataLayout[key]);
        fs.writeFileSync(jsonPath, JSON.stringify(spriteJson, null, 2));
      });

      // Pass `false` in the layout parameter to generate an image layout
      // suitable for exporting to a PNG sprite image file.
      spritezero.generateLayout({
        imgs,
        pixelRatio,
        format: false
      }, (err, imageLayout) => {
        spritezero.generateImage(imageLayout, (err, image) => {
          if (err) {
            throw err;
          }
          fs.writeFileSync(pngPath, image);
        });
      });
    });
  }));
}

function svg2sprite(dirname, glyph, templateOptions, fn) {
  try {
    svg2spriteImpl(dirname, glyph, templateOptions).then(() => fn());
  }
  catch (e) {
    fn(e);
  } 
}
