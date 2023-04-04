const path = require('node:path');
const fs = require('node:fs/promises');
const { findFiles, xml2json } = require("../util");

module.exports = {
  directory,
  bag
};

const SVG_DIR = path.resolve(__dirname, '../../svg');

function directory({ root = SVG_DIR, dir }) {
  const _root = path.resolve(root, dir);
  let _futureFiles;

  return {
    find,
    load,
    loadAll,
    subdirectory,
  };

  function subdirectory(dir) {
    return directory({ root: _root, dir });
  }

  function filename(name) {
    return path.resolve(_root, name) + `.svg`;
  }

  async function load(name, { parse } = {}) {
    const s = await fs.readFile(filename(name), 'utf-8');
    return parse ? await xml2json(s) : s;
  }

  async function loadAll(opts) {
    const files = await find();
    return Promise.all(files.map(f => load(f, opts)));
  }

  function find() {
    if (!_futureFiles) {
      _futureFiles = findFiles(/\.svg$/, _root);
    }
    return _futureFiles;
  }
}

function bag({ paths = [], ...opts }) {
  const _directory = directory(opts);
  const _nameMap = Object.fromEntries(
    paths.map(p => p.split(':'))
      .filter(([from, to]) => !!to && to !== from)
      .flatMap(([from, to]) => to.split(',').map(n => [n, from]))
  );
  const _futureAliases = createAliasMap();
  return {
    load
  };

  async function load(name, opts) {
    const aliases = await _futureAliases;
    name = _nameMap[name] || name;
    const alias = aliases[name];
    return _directory.load(path.join(alias, name), opts);
  }

  async function createAliasMap() {
    const files = await _directory.find();
    const entries = files.map(f => [
      path.basename(f, '.svg'),
      path.dirname(f)
    ]);
    return Object.fromEntries(entries);
  }
}
