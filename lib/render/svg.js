const sharp = require('sharp');

module.exports = {
  getDim,
  renderSprite,
};

async function getDim({ dim, svg }) {
  if (dim) {
    return dim;
  }
  const { width, height } = await sharp(svg).metadata();
  return { width, height };
}

async function renderSprite(items, { dim, layout }) {
  return sharp({
    create: {
      width: dim.width,
      height: dim.height,
      channels: 4, // RGBA
      background: 'transparent'
    }
  })
    .composite(await Promise.all(items.map(convert)))
    .png()
    .toBuffer();

  async function convert({ id, svg }) {
    const { x, y, width, height } = layout[id];
    const png = sharp(svg)
      .resize({ width, height }) // TODO: not needed if images sized properly
      .png();
    return {
      left: x,
      top: y,
      input: await png.toBuffer()
    };
  }
}
