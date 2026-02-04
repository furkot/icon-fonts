const { xml } = require('el-component');
const svgpath = require('svgpath');
const { xml2json } = require('./util.js');

module.exports = fonterize;

let size;
let viewBox;

function makeWider(path, dims) {
  const scale = size / dims.height;
  const adjustedWidth = dims.width * scale;
  const shift = (size - adjustedWidth) / 2;

  return svgpath(path)
    .scale(scale, scale)
    .translate(shift, 0) // center horizontally
    .abs()
    .round(3)
    .toString();
}

function makeTaller(path, dims) {
  const scale = size / dims.width;

  return svgpath(path).scale(scale, scale).abs().round(3).toString();
}

function getDimensions(json) {
  let viewBox = json.svg.$.viewBox;
  if (viewBox) {
    viewBox = viewBox.split(' ').map(p => Number.parseInt(p, 10));
    return {
      width: viewBox[2],
      height: viewBox[3]
    };
  }
  const width = Number.parseInt(json.svg.$.width, 10);
  const height = Number.parseInt(json.svg.$.height, 10);

  if (!Number.isNaN(width) && !Number.isNaN(height)) {
    return {
      width,
      height
    };
  }
}

function convert(json) {
  if (!json.svg.path) {
    // console.log(json.svg);
    throw new Error('No path found...');
  }

  let { path } = json.svg;
  path = path.$ ? [path] : Object.keys(path).map(key => path[key]);

  if (!path || !path.length) {
    // console.log(json.svg);
    throw new Error('Empty path...');
  }

  const dims = getDimensions(json);

  if (!dims) {
    throw new Error('Invalid dimensions...');
  }

  if (dims.height === size && dims.width === size) {
    throw new Error('No scaling needed....', true);
  }

  if (dims.height > dims.width) {
    path = path.map(path => makeWider(path.$.d, dims));
  } else {
    path = path.map(path => makeTaller(path.$.d, dims));
  }

  if (!(path.length && path.every(path => path.length))) {
    // console.log(json.svg);
    throw new Error('Resize failed...');
  }

  return path;
}

function path2svg(path) {
  return xml('svg', path.map(d => xml('path', { d })).join(''), {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox
  });
}

async function fonterize(data, iconDim) {
  size = iconDim;
  viewBox = [0, 0, size, size].join(' ');
  const path = convert(await xml2json(data));
  return path2svg(path);
}
