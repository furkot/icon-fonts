const find = require('find');
const { promisify } = require('util');
const { to_json } = require('xmljson');
const svgpath = require('svgpath');

const xml2json = promisify(to_json);
const findFiles = promisify((pattern, root, fn) => find.file(pattern, root, files => fn(null, files)));

module.exports = {
  findFiles,
  xml2json,
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
