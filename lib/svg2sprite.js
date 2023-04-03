const find = require('find');
const fs = require('fs').promises;
const path = require('path');
const { xml } = require('el-component');
const handlebars = require('handlebars');
const { promisify } = require('util');
const { to_json } = require('xmljson');

const { convert } = require('./util');
const { renderAll } = require("./render");

module.exports = svg2sprite;

const xml2json = promisify(to_json);
const findFiles = promisify((pattern, root, fn) => find.file(pattern, root, files => fn(null, files)));

async function svg2sprite(toDir, glyph, templateOptions) {
  const templatePath = path.resolve(__dirname, '../templates/sprite.html.hbs');
  const source = await fs.readFile(templatePath, 'utf8');
  const spriteTemplate = handlebars.compile(source);
  const {
    dirname,
    iconDim,
    paths,
    sprite,
    svgSpritePath: relativeSvgSpritePath
  } = templateOptions;
  const svgSpritePath = path.resolve(dirname, relativeSvgSpritePath);
  return Promise.all(sprite.map(onSprite));

  async function onSprite({ iconGroups, name, pixelRatio, pattern = {}, size }) {
    const { backdrops, iconPatterns } = await createBackdrops(pattern, iconGroups);
    const imgs = createImages(paths, size, pattern, iconPatterns, backdrops);
    imgs.push(...await createExtras(name, backdrops));
    const items = await renderAll(imgs, pixelRatio);
    return Promise.all(items.map(item => writeResults(name, item)));
  }

  function writeResults(name, { pixelRatio, layout, image }) {
    const basename = pixelRatio === 1 ? name : `${name}@${pixelRatio}x`;
    const pngName = path.join('sprite', `${basename}.png`);
    const pngPath = path.join(toDir, pngName);
    const jsonPath = path.join(toDir, 'sprite', `${basename}.json`);

    const tasks = [
      fs.writeFile(jsonPath, JSON.stringify(layout, null, 2)),
      fs.writeFile(pngPath, image)
    ];

    if (pixelRatio === 2) {
      tasks.push(writeHtml(layout, name, pngName));
    }

    return Promise.all(tasks);
  }

  async function createBackdrops(pattern, iconGroups) {
    const backdrops = {};
    const defaultPattern = pattern;
    initBackdrop(backdrops, defaultPattern.backdrop);
    const iconPatterns = {};
    iconGroups.forEach(({ icons, pattern }) => {
      const p = { ...defaultPattern, ...pattern };
      initBackdrop(backdrops, p.backdrop, defaultPattern.backdrop);
      icons.forEach(icon => iconPatterns[icon] = p);
    });
    await Promise.all(Object.entries(backdrops).map(item => resolveBackdrop(svgSpritePath, item)));
    return { backdrops, iconPatterns };

    async function resolveBackdrop(dirname, [name, backdrop]) {
      const filename = path.resolve(dirname, `${name}.svg`);
      const data = await fs.readFile(filename, 'utf-8');
      const { svg } = await xml2json(data);
      const viewBox = svg.$.viewBox.split(' ');
      backdrop.path = svg.path.$.d;
      backdrop.ratio = viewBox[3] / viewBox[2];
    }

    function initBackdrop(backdrops, b, defaultBackdrop) {
      b?.forEach((backdrop, i) => {
        if (defaultBackdrop?.[i]) {
          Object.assign(backdrop, { ...defaultBackdrop[i], ...backdrop });
        }
        const { name } = backdrop;
        if (name) {
          backdrops[name] = backdrops[name] || {};
        }
      });
    }
  }

  function createImages(paths, size, pattern, iconPatterns, backdrops) {
    return paths.map(path => path.split(':'))
      .filter(path => path.length == 2 && path[0] && path[1])
      .flatMap(([svg, path]) => path.split(',').flatMap(p => size.map(size => {
        const {
          backdrop, fill = pattern.fill, margin = pattern.margin || 0
        } = iconPatterns[p] || pattern;
        const width = size + 2 * margin;
        const layers = [];
        let ratio = 1;
        backdrop?.forEach(({ name, fill, width: bwidth = iconDim }) => {
          const bd = backdrops[name];
          if (bd.ratio > ratio) {
            ratio = bd.ratio;
          }
          layers.push({
            d: convert(bd.path, bwidth, iconDim, width, 0, true),
            fill
          });
        });
        layers.push({
          d: convert(glyph[svg].path, glyph[svg].width, iconDim, size - margin, 1.5 * margin),
          fill
        });
        const height = width * ratio;
        const dim = {
          width: Math.ceil(width),
          height: Math.ceil(height)
        };
        return {
          id: `${p}_${size}`,
          dim,
          svg: envelope(layers, dim)
        };
      })));
  }

  async function createExtras(name, backdrops) {
    const files = await findFiles(/\.svg$/, path.join(svgSpritePath, name));
    const extras = files
      .map(f => [f, path.basename(f)])
      .filter(([, basename]) => !backdrops[basename])
      .map(async ([f, basename]) => ({
        id: basename.replace('.svg', ''),
        ...await readSvg(f)
      }));
    return Promise.all(extras);

    async function readSvg(f) {
      const svg = await fs.readFile(f, 'utf-8');
      const doc = await xml2json(svg);
      const { width, height } = doc.svg.$;
      const dim = {
        width: parseInt(width, 10),
        height: parseInt(height, 10)
      };
      return { dim, svg };
    }
  }

  function writeHtml(spriteJson, name, pngName) {
    const images = Object.entries(spriteJson)
      .map(([name, { x, y, width, height }]) => ({
        name,
        position: `-${x}px -${y}px`,
        width: `${width}px`,
        height: `${height}px`
      }));
    const htmlPath = path.join(toDir, `${name}.html`);
    return fs.writeFile(htmlPath, spriteTemplate({
      spriteName: name,
      spriteSrc: pngName,
      images
    }));
  }
}

function envelope(layers, { width, height }) {
  const content = layers.map(o => xml('path', o)).join('');

  return xml('svg', content, {
    xmlns: "http://www.w3.org/2000/svg",
    width,
    height,
    viewBox: `0 0 ${width} ${height}`
  });
}
