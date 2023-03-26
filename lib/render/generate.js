
const ShelfPack = require('@mapbox/shelf-pack');
const { getDim } = require("./svg");

module.exports = {
  createLayout,
  scaleLayout,
};

function heightAscThanNameComparator(a, b) {
  return (b.height - a.height) || ((a.id === b.id) ? 0 : (a.id < b.id ? -1 : 1));
}

function keyComparator([a], [b]) {
  return a === b ? 0 : (a < b ? -1 : 1);
}

async function createLayout(imgs) {
  const items = await Promise.all(imgs.map(async img => {
    const { width, height } = await getDim(img);
    return { id: img.id, width, height };
  }));

  items.sort(heightAscThanNameComparator);

  const sprite = new ShelfPack(1, 1, { autoResize: true });
  sprite.pack(items, { inPlace: true });

  const layout = Object.fromEntries(
    items.map(item => [item.id, extract(item)]).sort(keyComparator)
  );

  return {
    layout,
    dim: {
      width: sprite.w,
      height: sprite.h
    }
  };

  function extract({ width, height, x, y }) {
    return { width, height, x, y, pixelRatio: 1 };
  }
}

function scaleLayout(spriteLayout, scale) {
  if (scale === 1) {
    return spriteLayout;
  }
  const { dim, layout } = spriteLayout;
  return {
    dim: resize(dim),
    layout: mapValues(layout, resize)
  };

  function resize(o) {
    return mapValues(o, v => scale * v);
  }

  // create new object by mapping values of the source object
  function mapValues(source, mapFn, thisArg) {
    return Object.fromEntries(
      Object
        .entries(source)
        .map(
          ([k, v], index) => [k, mapFn.call(thisArg, v, index)]
        )
    );
  }
}
