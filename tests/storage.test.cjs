'use strict';
const R = require('../core.js'), S = require('../storage.js');
function memory() {
  const data = new Map();
  return { data, getItem: k => data.has(k) ? data.get(k) : null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
}
module.exports = ({ test, assert }) => {
  test('empty storage never creates a saved practice', () => {
    const m = memory(); assert.deepEqual(S.load(m), { state: null, saved: false, warning: '' }); assert.equal(m.data.size, 0);
  });
  test('restores drafts, confidence, and a revealed attempt exactly', () => {
    const m = memory(); let state = R.createSession('Q: A task?\nA: A reference.');
    state.draft = { answer: 'My unfinished answer', confidence: 'medium' };
    assert.equal(S.save(m, state).saved, true); assert.deepEqual(S.load(m).state, state);
    state = R.recordAttempt(state, 'My answer', 'medium', '2026-01-01T12:00:00Z');
    state = R.reflect(state, 'partial', 'A note'); S.save(m, state); assert.deepEqual(S.load(m).state, state);
  });
  test('malformed JSON is reported and preserved rather than overwritten', () => {
    const m = memory(); m.setItem(S.KEY, '{broken'); const result = S.load(m);
    assert.equal(result.state, null); assert.equal(result.saved, false); assert.match(result.warning, /not.*overwritten|Nothing was loaded or overwritten/); assert.equal(m.getItem(S.KEY), '{broken');
  });
  test('unknown envelope and invalid state are not restored', () => {
    const m = memory(); for (const value of [null, {}, { format: 'future/3' }, { format: 'recall-local/1', state: {} }]) { m.setItem(S.KEY, JSON.stringify(value)); assert.equal(S.load(m).state, null); }
  });
  test('oversized storage is rejected without changing its bytes', () => {
    const m = memory(), value = 'x'.repeat(6000001); m.setItem(S.KEY, value); assert.equal(S.load(m).state, null); assert.equal(m.getItem(S.KEY), value);
  });
  test('quota failure preserves state and old saved copy with explicit warning', () => {
    const m = memory(); m.setItem(S.KEY, 'older copy'); m.setItem = () => { throw new Error('Quota'); };
    const state = R.createSession('Q: Q\nA: A'), before = JSON.stringify(state), result = S.save(m, state);
    assert.equal(result.saved, false); assert.match(result.warning, /Export/); assert.equal(m.getItem(S.KEY), 'older copy'); assert.equal(JSON.stringify(state), before);
  });
  test('unavailable storage degrades to a warning, not a crash', () => {
    assert.equal(S.load(null).state, null); assert.equal(S.save(null, R.createSession('Q: Q\nA: A')).saved, false); assert.equal(S.clear(null).cleared, false);
  });
  test('forget removes only this application key', () => {
    const m = memory(); m.setItem('unrelated', 'keep'); m.setItem(S.KEY, 'remove'); assert.equal(S.clear(m).cleared, true); assert.equal(m.getItem(S.KEY), null); assert.equal(m.getItem('unrelated'), 'keep');
  });
  test('failed deletion does not report successful removal', () => {
    assert.equal(S.clear({ removeItem() { throw new Error('Denied'); } }).cleared, false);
  });
  test('inconsistent saved progress is refused without altering saved bytes', () => {
    const m = memory(), state = R.createSession('Q: One?\nA: A reference.');
    state.position = 1;
    const raw = JSON.stringify({ format: 'recall-local/1', state });
    m.setItem(S.KEY, raw);
    const loaded = S.load(m);
    assert.equal(loaded.state, null); assert.equal(loaded.saved, false);
    assert.match(loaded.warning, /could not be read/); assert.equal(m.getItem(S.KEY), raw);
    assert.equal(S.save(m, state).saved, false); assert.equal(m.getItem(S.KEY), raw);
  });
  test('unavailable storage never produces a deletion receipt', () => {
    const result = S.clear(null);
    assert.equal(result.cleared, false);
    assert.match(result.warning, /could not be confirmed/);
    assert.match(result.warning, /tab has not been discarded/);
  });
  test('silent no-op removal is caught by readback without touching other keys', () => {
    const m = memory(); m.setItem(S.KEY, 'synthetic saved copy'); m.setItem('unrelated', 'keep');
    m.removeItem = () => {};
    assert.equal(S.clear(m).cleared, false);
    assert.equal(m.getItem(S.KEY), 'synthetic saved copy'); assert.equal(m.getItem('unrelated'), 'keep');
  });
  test('removal followed by unreadable storage remains unconfirmed', () => {
    let removed = false;
    const result = S.clear({ removeItem() { removed = true; }, getItem() { throw new Error('Denied'); } });
    assert.equal(removed, true); assert.equal(result.cleared, false);
    assert.match(result.warning, /could not be confirmed/);
  });
};
