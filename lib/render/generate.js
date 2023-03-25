const { promisify } = require('util');

const mapnik = require('mapnik');
const ShelfPack = require('@mapbox/shelf-pack');

module.exports.generateLayout = generateLayout;
module.exports.generateImage = generateImage;

function heightAscThanNameComparator(a, b) {
  return (b.height - a.height) || ((a.id === b.id) ? 0 : (a.id < b.id ? -1 : 1));
}

function keyComparator([a], [b]) {
  return a === b ? 0 : (a < b ? -1 : 1);
}
/**
 * Pack a list of images with width and height into a sprite layout.
 * options object with the following keys:
 *
 * @param   {Object[]}              [options.imgs]                 Array of `{ svg: Buffer, id: String }`
 * @param   {number}                [options.pixelRatio]           Ratio of a 72dpi screen pixel to the destination pixel density
 * @param   {boolean}               [options.format]               If true, generate {@link DataLayout}; if false, generate {@link ImgLayout}
 * @return  {DataLayout|ImgLayout}  layout                         Generated Layout Object with sprite contents
 */
async function generateLayout({ imgs, pixelRatio, format }) {

  const rendered = await Promise.all(imgs.map(img => renderSvg(img, pixelRatio)));
  const items = rendered
    .filter(Boolean)
    .sort(heightAscThanNameComparator);

  const sprite = new ShelfPack(1, 1, { autoResize: true });
  sprite.pack(items, { inPlace: true });

  // object needed for generateImage
  const imageLayout = {
    width: sprite.w,
    height: sprite.h,
    items
  };

  if (!format) {
    return { imageLayout };
  }

  const dataLayout = Object.fromEntries(
    items.map(item => [item.id, extract(item)]).sort(keyComparator)
  );
  return { dataLayout, imageLayout };

  function extract({ width, height, x, y }) {
    return { width, height, x, y, pixelRatio };
  }
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
