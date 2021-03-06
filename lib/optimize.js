var fs = require('fs');
var find = require('find');
var SVGO = require('svgo');
var async = require('async');
var path = require('path');
var fonterize = require('./fonterize');

var svgoConfig = {
  full: true,
  multipass: true,
  plugins: [
    'removeTitle',
    'removeDesc',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'removeRasterImages',
    'cleanupAttrs',
    'convertStyleToAttrs',
    'removeEmptyAttrs',
    'convertColors',
    'removeEmptyContainers',
    'cleanupIDs',
    'removeUnusedNS',
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'cleanupEnableBackground',
    'removeHiddenElems',
    'removeEmptyText',
    'collapseGroups',
    'convertShapeToPath',
    'mergePaths',
    'cleanupNumericValues'
  ]
};

var svgo = new SVGO(svgoConfig);

module.exports = optimize;

let iconDim = 512;

async function optimizeData(data) {
  return await svgo.optimize(data);
}

function rescale(file, { data }, fn) {
  fonterize(data, iconDim, function(err, result) {
    if(err) {
      if (!result) {
        console.error('cannot rescale', err, ':', file);
      }
      return fn(null, data);
    }
    fn(err, result);
  });
}

function optimizeFile(file, fn) {
  async.waterfall([
    async.apply(fs.readFile, file, 'utf8'),
    optimizeData,
    async.apply(rescale, file),
    async.apply(fs.writeFile, file)
  ], function(err) {
    if (err) {
      console.error(err, ':', file);
    }
    fn();
  });
}

function optimize(dir, fn) {
  find.file(/\.svg$/, dir, function (files) {
    async.each(files, optimizeFile, fn);
  });
}

if (!module.parent) {
  if (process.argv[3]) {
    const filename = path.resolve(__dirname, process.argv[3]);
    iconDim = require(filename).templateOptions.iconDim;
  }
  optimize(process.argv[2], function(err) {
    if(err) {
      console.error(err);
      process.exit(1);
    }
  });
}
