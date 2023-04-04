const { xml } = require('el-component');

module.exports = {
  makeSvg,
  resizeSvg
};

function makeSvg(img, backdrop, opts) {
  return backdrop.layers.length > 0 ?
    wrapSvg(img, backdrop, opts) :
    adjustSvg(img, backdrop, opts);
}

function wrapSvg({ svg }, { fill, margin, layers, dim = {} }, { iconDim, iconScaleFactor }) {
  margin *= iconScaleFactor;
  const size = iconDim - 2 * margin;
  const attrs = attrs2str({
    x: margin,
    y: margin,
    width: size,
    height: size,
    fill
  });
  const symbol = svg
    .replace(/^<svg/, `<svg ${attrs}`);

  const content = [
    ...layers.map(o => xml('path', o)),
    symbol
  ].join('');
  const {
    width = iconDim,
    height = iconDim
  } = dim;
  return xml('svg', content, {
    xmlns: "http://www.w3.org/2000/svg",
    width,
    height,
    viewBox: `0 0 ${width} ${height}`
  });
}

function adjustSvg({ svg }, { fill }, { iconDim }) {
  const attrs = attrs2str({
    width: iconDim,
    height: iconDim,
    fill
  });
  return svg
    .replace(/^<svg/, `<svg ${attrs}`);
}

function resizeSvg(svg, { width, height }) {
  return svg
    .replace(/width="[\.\d]+"/, `width="${width}"`)
    .replace(/height="[\.\d]+"/, `height="${height}"`);
}

function attrs2str(obj) {
  return Object.entries(obj)
    .filter(e => e[1] != null)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}
