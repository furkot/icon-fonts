var xml = require('el-component').xml;
var svgpath = require('svgpath');
var async = require('async');
const { xml2json } = require('./util');

module.exports = fonterize;

var size, viewBox;

function makeWider(path, dims) {
  var scale = size / dims.height;
  var adjustedWidth = dims.width * scale;
  var shift = (size - adjustedWidth) / 2;

  return svgpath(path)
    .scale(scale, scale)
    .translate(shift, 0)  // center horizontally
    .abs()
    .round(3)
    .toString();
}

function makeTaller(path, dims) {
  var scale = size / dims.width;

  return svgpath(path)
    .scale(scale, scale)
    .abs()
    .round(3)
    .toString();
}


function getDimensions(json) {
  var viewBox = json.svg.$.viewBox;
  if (viewBox) {
    viewBox = viewBox.split(' ').map(function(p) {
      return parseInt(p, 10);
    });
    return {
      width: viewBox[2],
      height: viewBox[3]
    };
  }
  var width = parseInt(json.svg.$.width, 10);
  var height = parseInt(json.svg.$.height, 10);

  if (!isNaN(width) && !isNaN(height)) {
    return {
      width: width,
      height: height
    };
  }
}

function convert(json, fn) {
  if (!json.svg.path) {
    // console.log(json.svg);
    return fn('No path found...');
  }

  let { path } = json.svg;
  path = path.$ ? [ path ] : Object.keys(path).map(key => path[key]);

  if (!path || !path.length) {
    // console.log(json.svg);
    return fn('Empty path...');
  }

  const dims = getDimensions(json);

  if (!dims) {
    return fn('Invalid dimensions...');
  }

  if (dims.height === size && dims.width === size) {
    return fn('No scaling needed....', true);
  }

  if (dims.height > dims.width) {
    path = path.map((path) => makeWider(path.$.d, dims));
  } else {
    path = path.map((path) => makeTaller(path.$.d, dims));
  }

  if (!(path.length && path.every(path => path.length))) {
    // console.log(json.svg);
    return fn('Resize failed...');
  }

  fn(null, path);
}

function path2svg(path, fn) {
  var svg = xml('svg', path.map(d => xml('path', { d })).join(''), {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: viewBox
  });
  fn(null, svg);
}

function fonterize(data, iconDim, fn) {
  size = iconDim;
  viewBox = [0, 0, size, size].join(' ');
  async.waterfall([
    async data => xml2json(data),
    convert,
    path2svg
  ], fn);
}
