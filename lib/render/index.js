const { createLayout, scaleLayout } = require('./generate');
const { renderSprite } = require('./svg');

module.exports = {
  renderAll
};

async function renderAll(items, pixelRatios) {
  const imgs = items.map(convert);
  const baseLayout = await createLayout(imgs);
  return Promise.all(
    pixelRatios.map(pixelRatio => render(imgs, baseLayout, pixelRatio))
  );
}

async function render(imgs, baseLayout, pixelRatio) {
  const spriteLayout = scaleLayout(baseLayout, pixelRatio);
  return {
    pixelRatio,
    layout: spriteLayout.layout,
    image: await renderSprite(imgs, spriteLayout)
  };
}

function convert({ id, dim, svg }) {
  return {
    id,
    dim,
    svg: Buffer.from(svg),
  };
}
