var mapnik = require('mapnik');
var ShelfPack = require('@mapbox/shelf-pack');
var queue = require('queue-async');

module.exports.generateLayout = generateLayout;
module.exports.generateImage = generateImage;

function heightAscThanNameComparator(a, b) {
  return (b.height - a.height) || ((a.id === b.id) ? 0 : (a.id < b.id ? -1 : 1));
}

/**
 * Pack a list of images with width and height into a sprite layout.
 * options object with the following keys:
 *
 * @param   {Object}                [options]
 * @param   {Object[]}              [options.imgs]                 Array of `{ svg: Buffer, id: String }`
 * @param   {number}                [options.pixelRatio]           Ratio of a 72dpi screen pixel to the destination pixel density
 * @param   {boolean}               [options.format]               If true, generate {@link DataLayout}; if false, generate {@link ImgLayout}
 * @param   {Function}              callback                       Accepts two arguments, `err` and `layout` Object
 * @return  {DataLayout|ImgLayout}  layout                         Generated Layout Object with sprite contents
 */
function generateLayout(options, callback) {
  const { pixelRatio: scale } = options;
  function createImages(img, callback) {
    renderSvg(img, scale, callback);
  }

  var q = new queue();

  options.imgs.forEach((img) => {
    q.defer(createImages, img);
  });

  q.awaitAll((err, imagesWithSizes) => {
    if (err) return callback(err);

    imagesWithSizes = imagesWithSizes.filter((img) => img);
    imagesWithSizes.sort(heightAscThanNameComparator);

    var sprite = new ShelfPack(1, 1, { autoResize: true });
    sprite.pack(imagesWithSizes, { inPlace: true });

    // object needed for generateImage
    const imageLayout = {
      width: sprite.w,
      height: sprite.h,
      items: imagesWithSizes
    };

    if (options.format) {
      var dataLayout = {};
      imagesWithSizes.forEach((item) => {
        var itemIdsToUpdate = [item.id];
        itemIdsToUpdate.forEach((itemIdToUpdate) => {
          dataLayout[itemIdToUpdate] = {
            width: item.width,
            height: item.height,
            x: item.x,
            y: item.y,
            pixelRatio: options.pixelRatio
          };

          ['content', 'placeholder', 'stretchX', 'stretchY'].forEach(key => {
            if (item[key]) { dataLayout[itemIdToUpdate][key] = item[key]; }
          });
        });
      });
      return callback(null, dataLayout, imageLayout);
    } else {
      return callback(null, imageLayout);
    }

  });
}


function renderSvg(img, scale, callback) {
  mapnik.Image.fromSVGBytes(img.svg, { scale }, (err, image) => {
    // Produce a null result if no width or height attributes. The error message from mapnik has a typo "then"; account for potential future fix to "than".
    if (err && err.message.match(/image created from svg must have a width and height greater (then|than) zero/))
      return callback(null, null);
    if (err)
      return callback(err);
    if (!image.width() || !image.height())
      return callback(null, null);

    return callback(null, {
      ...img,
      width: image.width(),
      height: image.height(),
      buffer: image
    });
  });
}

/**
 * Generate a PNG image with positioned icons on a sprite.
 *
 * @param  {ImgLayout}   layout    An {@link ImgLayout} Object used to generate the image
 * @param  {Function}    callback  Accepts two arguments, `err` and `image` data
 */
function generateImage(layout, callback) {
  mapnik.blend(layout.items, {
    width: layout.width,
    height: layout.height
  }, callback);
}
