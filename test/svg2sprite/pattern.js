const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { addPatternDefaults } = require('../../lib/svg2sprite/pattern');

describe('add defaults to pattern', () => {
  const dp = {
    fill: '#aaa',
    margin: 2,
    backdrop: [
      { name: 'b/shield', fill: '#aaa' },
      { name: 'b/backgd', fill: '#fff' }
    ]
  };

  it('no overwrites', () => {
    const p = addPatternDefaults({}, dp);
    assert.notEqual(p, dp);
    assert.deepEqual(p, dp);
  });

  it('overwrite margin', () => {
    const p = addPatternDefaults({ margin: 0 }, dp);
    assert.notEqual(p, dp);
    assert.equal(p.margin, 0);
    assert.equal(p.fill, dp.fill);
    assert.deepEqual(p.backdrop, dp.backdrop);
  });

  it('overwrite backdrop', () => {
    const g = {
      backdrop: [
        { fill: '#ccc' },
        { name: 'b/lgreen' }
      ]
    };
    const p = addPatternDefaults(g, dp);
    assert.notEqual(p, dp);
    assert.equal(p.margin, dp.margin);
    assert.equal(p.fill, dp.fill);
    assert.equal(p.backdrop.length, 2);
    const [b1, b2] = p.backdrop;
    assert.deepEqual(b1, { name: 'b/shield', fill: '#ccc' });
    assert.deepEqual(b2, { name: 'b/lgreen', fill: '#fff' });
  });
});
