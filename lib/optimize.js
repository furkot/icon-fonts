const { promisify } = require('util');
const fs = require('fs').promises;
const find = require('find');
const svgo = require('svgo');
const path = require('path');
const fonterize = promisify(require('./fonterize'));

const findFiles = promisify((pattern, root, fn) => find.file(pattern, root, files => fn(null, files)));

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
    'cleanupIds',
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

module.exports = optimize;

let iconDim = 512;

async function rescale(file, { data }) {
  if (iconDim < 0) {
    return data;
  }
  try {
    return await fonterize(data, iconDim);
  } catch (err) {
    if (typeof err === 'string' && err.startsWith('No scaling needed')) {
      return data;
    }
    throw err;
  }
}

async function optimizeFile(file) {
  try {
    const svg = await fs.readFile(file, 'utf8');
    const optimized = svgo.optimize(svg, svgoConfig);
    const scaled = await rescale(file, optimized);
    await fs.writeFile(file, scaled);
  } catch (err) {
    console.error('cannot optimize', err, ':', file);
  }
}

async function optimize(dir) {
  const files = await findFiles(/\.svg$/, dir);
  return Promise.all(files.map(optimizeFile));
}

if (!module.parent) {
  const args = process.argv.slice(2);
  if (args[0] === '--no-rescale') {
    iconDim = -1;
    args.shift();
  }
  else {
    svgoConfig.plugins.push('removeDimensions');
    svgoConfig.floatPrecision = 0;
  }
  const [ dir, jsonFile ] = args;
  if (jsonFile) {
    const filename = path.resolve(__dirname, jsonFile);
    iconDim = require(filename).templateOptions.iconDim;
  }
  optimize(dir)
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
