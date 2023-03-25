const { promisify } = require('util');
const mapnik = require('mapnik');

module.exports = {
  renderSvg,
  generateImage
}

const renderSvgImage = promisify(mapnik.Image.fromSVGBytes);

async function renderSvg(img, scale) {
  const image = await renderSvgImage(img.svg, { scale });
  const dim = {
    width: image.width(),
    height: image.height(),
  };

  if (!dim.width || !dim.height) {
    return;
  }

  return {
    ...img,
    ...dim,
    buffer: image
  };
}
exports.renderSvg = renderSvg;
const blendImages = promisify(mapnik.blend);
/**
 * Generate a PNG image with positioned icons on a sprite.
 *
 * @param  {ImgLayout}   layout    An {@link ImgLayout} Object used to generate the image
 * @param  {Function}    callback  Accepts two arguments, `err` and `image` data
 */
function generateImage({ items, width, height }) {
  return blendImages(items, { width, height });
}
