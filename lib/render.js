const {
  layout: { pack: createLayout, scale: scaleLayout },
  sprite: { render: renderSprite }
} = require('@mapwhit/spriteone');

module.exports = {
  renderAll
};

async function renderAll(imgs, pixelRatios) {
  const baseLayout = await createLayout(imgs);
  return Promise.all(
    pixelRatios.map(pixelRatio => render(imgs, baseLayout, pixelRatio))
  );
}

async function render(items, baseLayout, pixelRatio) {
  const imgs = items.map(img => convert(img, pixelRatio));
  const spriteLayout = scaleLayout(baseLayout, pixelRatio);
  return {
    pixelRatio,
    layout: spriteLayout.layout,
    image: await renderSprite(imgs, { ...spriteLayout, format: 'webp' })
  };
}

function convert({ id, dim, svg }, pixelRatio) {
  if (pixelRatio != 1) {
    // TODO: use svg/dom manipulation
    svg = svg
      .replace(/width="\d+"/, `width="${dim.width * pixelRatio}"`)
      .replace(/height="\d+"/, `height="${dim.height * pixelRatio}"`);
  }
  return {
    id,
    dim,
    img: Buffer.from(svg),
  };
}
