const fs = require('node:fs/promises');
const path = require('node:path');

const { renderAll } = require('../render');
const { xml2json } = require('../util');
const { addPatternDefaults } = require('./pattern');
const { makeSvg, resizeSvg } = require('./svg');
const { writeResults } = require('./write');
const { directory, bag } = require('./directory');

module.exports = svg2sprite;

async function svg2sprite(toDir, templateOptions) {
  const {
    dirname,
    colorScheme,
    sprite,
    svgPath,
    svgSpritePath,
    iconDim
  } = templateOptions;
  const spriteDirectory = directory({
    root: dirname,
    dir: svgSpritePath
  });
  sprite.forEach(s => {
    const {
      colorScheme: cs,
      svgSourceFiles = []
    } = s;
    if (cs) {
      const nameMap = Object.entries(svgSourceFiles).reduce((result, [from, to]) => {
        result[to] = result[to] || [];
        result[to].push(from);
        return result; 
      }, Object.create(null));
      Object.assign(s, {
        ...colorScheme[cs],
        iconGroups: colorScheme[cs].iconGroups.map(group => {
          return {
            ...group,
            icons: group.icons.map(icon => nameMap[icon] || icon).flat()
          };
        }) 
      });
    }
  });
  return Promise.all(sprite.map(generateSprite));

  async function generateSprite(sprite) {
    const { name, pixelRatio, size: defaultSize, svgSourceFiles } = sprite;
    const iconBag = bag({
      root: dirname,
      dir: svgPath,
      nameMap: svgSourceFiles
    });
    const extrasDirectory = spriteDirectory.subdirectory(name);
    const imgs = [];
    for await (const img of yieldIcon(sprite)) {
      imgs.push(img);
    }
    imgs.push(...await createExtras(extrasDirectory));
    const items = await renderAll(imgs, pixelRatio);
    return Promise.all(items.map(item => writeResults(toDir, name, item)));

    async function* yieldIcon({ iconGroups, pattern: defaultPattern }) { // jshint ignore:line
      for (const { icons, pattern: groupPatern, size = defaultSize } of iconGroups) {
        const pattern = addPatternDefaults(groupPatern, defaultPattern);
        const backdrop = await resolvePattern(pattern);
        const aspectRatio = backdrop.dim ? backdrop.dim.height / backdrop.dim.width : 1;
        for (const id of icons) {
          const svg = await iconBag.load(id);
          const img = makeSvg({ id, svg }, backdrop, { iconDim });
          for(const [ s, width ] of Object.entries(size)) {
            const dim = {
              width,
              height: Math.ceil(aspectRatio * width)
            };
            yield {
              id: `${id}_${s}`,
              svg: resizeSvg(img, dim),
              dim
            };
          }
        }
      }
    }

    async function resolvePattern({ backdrop, fill, margin }) {
      const resolved = await Promise.all(backdrop.map(async b => {
        const { svg } = await spriteDirectory.load(b.name, { parse: true });
        const [, , width, height] = svg.$.viewBox.split(' ').map(parseFloat);
        return {
          ...b,
          path: svg.path.$.d,
          dim: { width, height }
        };
      }));
      return resolved.reduce((result, bd) => {
        updateDim(result.dim, bd.dim);
        result.layers.push({
          d: bd.path,
          fill: bd.fill
        });
        return result;
      }, {
        dim: { width: 512, height: 512 },
        layers: [],
        margin,
        fill
      });
    }

    function updateDim(dim, { width, height }) {
      if (dim.width < width) {
        dim.width = width;
      }
      if (dim.height < height) {
        dim.height = height;
      }
      return dim;
    }
  }
}

async function createExtras(extras) {
  const files = await extras.find();
  return Promise.all(files
    .map(f => [f, path.basename(f, '.svg')])
    .map(async ([f, id]) => ({
      id,
      ...await readSvg(f)
    })));

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

