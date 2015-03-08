var fs = require('fs');
var find = require('find');
var async = require('async');
var xmljson = require('xmljson');

module.exports = verify;

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

  if (viewBox[2] > 512 || viewBox[3] > 512) {
    error('viewBox too big', file);
  }

  if (viewBox[2] < 512 || viewBox[3] < 512) {
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
  find.file(/\.svg$/, dir, function (files) {
    async.each(files, verifyFile, fn);
  });
}

if (!module.parent) {
  verify(process.argv[2], function(err) {
    if(err) {
      console.error(err);
      process.exit(1);
    }
    dump();
  });
}
