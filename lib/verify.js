const fs = require('node:fs/promises');
const path = require('node:path');
const { findFiles, xml2json } = require('./util');

module.exports = verify;

let iconDim = 512;

const errors = {};

function error(type, file) {
  if (!errors[type]) {
    errors[type] = [];
  }
  errors[type].push(file);
}

function dump() {
  Object.keys(errors).forEach(type => {
    console.log(type, ':');
    errors[type].forEach(file => {
      console.log('\t', file);
    });
    console.log('\n');
  });
}

function verifyData(file, json) {
  if (!json.svg) {
    error('not an svg file', file);
    return;
  }
  const svg = json.svg;
  let viewBox = svg.$.viewBox;
  if (!viewBox) {
    error('missing viewBox', file);
    return;
  }

  viewBox = viewBox.split(' ').map(p => Number.parseInt(p, 10));

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
}

async function verifyFile(file) {
  const str = await fs.readFile(file, 'utf8');
  const data = await xml2json(str);
  return verifyData(file, data);
}

async function verify(dir) {
  const files = await findFiles(/\.svg$/, dir);
  return Promise.all(files.map(verifyFile));
}

if (!module.parent) {
  if (process.argv[3]) {
    const filename = path.resolve(__dirname, process.argv[3]);
    iconDim = require(filename).templateOptions.iconDim;
  }

  verify(process.argv[2]).then(dump, err => {
    console.error(err);
    process.exit(1);
  });
}
