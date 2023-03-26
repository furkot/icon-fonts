const fs = require('fs');
const find = require('find');
const SVGO = require('svgo');
const async = require('async');
const path = require('path');
const fonterize = require('./fonterize');

const svgoConfig = {
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

const svgo = new SVGO(svgoConfig);

module.exports = optimize;

let iconDim = 512;

async function optimizeData(data) {
  return await svgo.optimize(data);
}

function rescale(file, { data }, fn) {
  fonterize(data, iconDim, (err, result) => {
    if (err) {
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
  ], err => {
    if (err) {
      console.error(err, ':', file);
    }
    fn();
  });
}

function optimize(dir, fn) {
  find.file(/\.svg$/, dir, files => {
    async.each(files, optimizeFile, fn);
  });
}

if (!module.parent) {
  if (process.argv[3]) {
    const filename = path.resolve(__dirname, process.argv[3]);
    iconDim = require(filename).templateOptions.iconDim;
  }
  optimize(process.argv[2], err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}
