const test = require('node:test');
const assert = require('node:assert/strict');

const { makeSvg } = require('../../lib/svg2sprite/svg');


test('make svg', () => {
  const expected = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="592" viewBox="0 0 512 592">
      <path d="M 24 24 L 488 24"/>
      <svg x="64" y="64" width="384" height="384" fill="#aaa" viewbox="0 0 512 512">
        <path d="M 0 0 L 40 50"/>
      </svg>
    </svg>
  `.split('\n').map(x => x.trim()).join('');
  const backdrop = {
    fill: '#aaa',
    margin: 2,
    dim: { width: 512, height: 592 },
    layers: [{ d: 'M 24 24 L 488 24' }]
  };
  const svg = makeSvg({
    id: 'a',
    svg: '<svg viewbox="0 0 512 512"><path d="M 0 0 L 40 50"/></svg>'
  }, backdrop, { iconDim: 512, iconScaleFactor: 32 });
  assert.equal(svg, expected);
});

test('adjust svg', () => {
  const expected = `
    <svg width="512" height="512" fill="#aaa" viewBox="0 0 512 512">
        <path d="M 0 0 L 40 50"/>
    </svg>
  `.split('\n').map(x => x.trim()).join('');
  const backdrop = {
    fill: '#aaa',
    dim: { width: 512, height: 592 },
    layers: []
  };
  const svg = makeSvg({
    id: 'a',
    svg: '<svg viewBox="0 0 512 512"><path d="M 0 0 L 40 50"/></svg>'
  }, backdrop,  { iconDim: 512 });
  assert.deepEqual(svg, expected);
});
