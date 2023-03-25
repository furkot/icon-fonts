const { generateLayout, generateImage } = require('./generate');

module.exports = {
  render
};

async function render(items, pixelRatio) {
  const imgs = items.map(convert);
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
