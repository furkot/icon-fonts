const fs = require('node:fs/promises');
const path = require('node:path');
const { promisify } = require('node:util');
const { to_json } = require('xmljson');
const svgpath = require('svgpath');

const xml2json = promisify(to_json);

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

async function findFiles(pattern, root) {
  try {
    await fs.access(root, fs.constants.R_OK);
    const all = await fs.readdir(root, { recursive: true });
    return all.filter(n => pattern.test(n)).map(n => path.resolve(root, n));
  }
  catch {
    return [];
  }
}
