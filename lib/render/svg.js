const sharp = require('sharp');

module.exports = {
  renderSvg,
  generateImage
};

async function renderSvg({ id, svg }, scale) {
  let s = sharp(svg);
  let { width, height } = await s.metadata();

  if (scale != 1) {
    width *= scale;
    height *= scale;
    s = s.resize({ width });
  }

  return {
    id,
    width,
    height,
    buffer: await s.png().toBuffer()
  };
}
exports.renderSvg = renderSvg;

/**
 * Generate a PNG image with positioned icons on a sprite.
 *
 * @param  {ImgLayout}   layout    An {@link ImgLayout} Object used to generate the image
 * @param  {Function}    callback  Accepts two arguments, `err` and `image` data
 */
function generateImage({ items, width, height }) {
  return sharp({
    create: {
      width,
      height,
      channels: 4, // RGBA
      background: 'transparent'
    }
  })
  .composite(
    items.map(item => ({
      input: item.buffer,
      left: item.x,
      top: item.y
    }))
  )
  .png()
  .toBuffer();
}
