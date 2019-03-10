const svgpath = require('svgpath');

module.exports = {
    convert
};

function convert(path, width, iconDim, size, margin, ident) {
  const ratio = size / iconDim;
  return svgpath(path)
    .translate((iconDim - width) / 2, 0)
    .scale(ratio, ident ? ratio : -ratio) // scale *and* flip Y axis
    .translate(margin, ident ? margin : size + margin)  // move to the center of the pin
    .abs()
    .round(1)
    .toString();
}
