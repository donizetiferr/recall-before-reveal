(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.RecallStorage = factory(root.Recall);
})(globalThis, function (core) {
  'use strict';
  const KEY = 'recall-before-reveal.saved.v1';
  function load(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (raw === null) return { state: null, saved: false, warning: '' };
      if (raw.length > 6000000) throw new Error('Saved practice is too large.');
      const data = JSON.parse(raw);
      if (data.format !== 'recall-local/1') throw new Error('Unsupported saved format.');
      return { state: core.validateState(data.state), saved: true, warning: '' };
    } catch {
      return { state: null, saved: false, warning: 'Saved practice could not be read. Nothing was loaded or overwritten. Use Forget practice to remove it, or explicitly save a new set.' };
    }
  }
  function save(storage, state) {
    try { storage.setItem(KEY, JSON.stringify({ format: 'recall-local/1', state: core.validateState(state) })); return { saved: true, warning: '' }; }
    catch { return { saved: false, warning: 'Browser saving failed. Your practice is still here in this tab. Export attempts before closing.' }; }
  }
  function clear(storage) {
    try { storage.removeItem(KEY); return { cleared: true, warning: '' }; }
    catch { return { cleared: false, warning: 'Browser data could not be removed. Clear this site’s data in browser settings; this tab has not been discarded.' }; }
  }
  return Object.freeze({ KEY, load, save, clear });
});
