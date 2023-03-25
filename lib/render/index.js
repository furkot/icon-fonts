const generate = require('./generate');
const { promisify } = require('util');

module.exports = {
  render
};

const generateLayout = promisify(generate.generateLayout);
const generateImage = promisify(generate.generateImage);

// Pass `true` in the layout parameter to generate a data layout
// suitable for exporting to a JSON sprite manifest file.
// Pass `false` in the layout parameter to generate an image layout
// suitable for exporting to a PNG sprite image file.

async function render(items, pixelRatio) {
  const imgs = items.map(convert);
  const { dataLayout, imageLayout } = await generateLayout({ imgs, pixelRatio, format: true });
  const layout = {};
  Object.keys(dataLayout).sort().forEach(key => layout[key] = dataLayout[key]);
  const image = await generateImage(imageLayout);
  return { layout, image };
}

function convert({ svg, id }) {
  return {
    svg: Buffer.from(svg),
    id
  };
}
