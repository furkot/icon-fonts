const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { directory, bag } = require('../../lib/svg2sprite/directory');

describe('directory', () => {
  it('files', async () => {
    const d = directory({ dir: 'sprite/backdrop' });
    const files = await d.find();
    assert.equal(files.length, 2);
    assert.ok(files.some(f => f.match(/background.svg$/)));
    assert.ok(files.some(f => f.match(/shield.svg$/)));
  });

  it('load', async () => {
    const d = directory({ dir: 'sprite' });
    const text = await d.load('backdrop/background');
    assert.ok(text.startsWith('<svg'));
    assert.ok(text.endsWith('</svg>\n'));
  });
});

describe('bag', () => {
  it('load', async () => {
    const b = bag({ dir: 'furkot' });
    const { svg } = await b.load('cloudy', { parse: true });
    assert.equal(svg.$.viewBox, '0 0 512 512');
  });
});
