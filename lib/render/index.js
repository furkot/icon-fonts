const { generateLayout, generateImage } = require('./generate');

module.exports = {
  renderAll
};

function renderAll(items, pixelRatios) {
  const imgs = items.map(convert);
  const tasks = pixelRatios.map(async pixelRatio => ({
    pixelRatio,
    ...await render(imgs, pixelRatio)
  }));
  return Promise.all(tasks);
}

async function render(imgs, pixelRatio) {
  const { dataLayout, imageLayout } = await generateLayout({ imgs, pixelRatio, format: true });
  return {
    layout: dataLayout,
    image: await generateImage(imageLayout)
  };
}

function convert({ svg, id }) {
  return {
    svg: Buffer.from(svg),
    id
  };
}
