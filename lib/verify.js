var fs = require('fs');
var async = require('async');
var xmljson = require('xmljson');
var path = require('path');
const { findFiles } = require('./util');

module.exports = verify;

let iconDim = 512;

var errors = {};

function error(type, file) {
  if (!errors[type]) {
    errors[type] = [];
  }
  errors[type].push(file);
}

function dump() {
  Object.keys(errors).forEach(function(type) {
    console.log(type, ':');
    errors[type].forEach(function(file) {
      console.log('\t', file);
    });
    console.log('\n');
  });
}

function verifyData(file, json, fn) {
  if (!json.svg) {
    error('not an svg file', file);
    return fn();
  }
  var svg = json.svg;
  var viewBox = svg.$.viewBox;
  if (!viewBox) {
    error('missing viewBox', file);
    return fn();
  }

  viewBox = viewBox.split(' ').map(function(p) {
    return parseInt(p, 10);
  });

  if (viewBox[0] !== 0 || viewBox[1] !== 0) {
    error('viewBox does not start at 0,0', file);
  }

  if (viewBox[2] !== viewBox[3]) {
    error('viewBox is not square', file);
  }

  if (viewBox[2] > iconDim || viewBox[3] > iconDim) {
    error('viewBox too big', file);
  }

  if (viewBox[2] < iconDim || viewBox[3] < iconDim) {
    error('viewBox too small', file);
  }

  fn();
}

function verifyFile(file, fn) {
  async.waterfall([
    async.apply(fs.readFile, file, 'utf8'),
    xmljson.to_json,
    async.apply(verifyData, file),
  ], fn);
}

function verify(dir, fn) {
  findFiles(/\.svg$/, dir).then(function (files) {
    async.each(files, verifyFile, fn);
  }, fn);
}

if (!module.parent) {
  if (process.argv[3]) {
    const filename = path.resolve(__dirname, process.argv[3]);
    iconDim = require(filename).templateOptions.iconDim;
  }

  verify(process.argv[2], function(err) {
    if(err) {
      console.error(err);
      process.exit(1);
    }
    dump();
  });
}
