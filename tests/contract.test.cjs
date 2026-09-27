'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
module.exports = ({ test, assert }) => {
  test('test harness refuses network and child process calls', () => {
    assert.throws(() => globalThis.fetch('https://example.invalid'), /disabled/);
    assert.throws(() => require('node:child_process').spawn('unused'), /disabled/);
    assert.throws(() => require('node:net').connect({}), /disabled/);
  });
  test('declared runtime has no dependencies or install hooks', () => {
    const pkg = JSON.parse(read('package.json'));
    assert.deepEqual(pkg.dependencies, {}); assert.deepEqual(pkg.devDependencies, {});
    assert.equal(pkg.private, true); assert.equal(pkg.engines.node, '>=22');
    for (const key of ['preinstall', 'install', 'postinstall', 'prepare']) assert.ok(!(key in pkg.scripts));
  });
  test('page uses local classic scripts, no remote requests or unsafe HTML insertion', () => {
    const html = read('index.html'), app = read('app.js'), css = read('styles.css');
    const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x => x[1]);
    assert.deepEqual(scripts, ['core.js', 'storage.js', 'app.js']);
    for (const source of [html, app, css, read('core.js'), read('storage.js')]) assert.doesNotMatch(source, /https?:\/\//);
    assert.doesNotMatch(app, /innerHTML|outerHTML|insertAdjacentHTML|eval\(|new Function|fetch\(|XMLHttpRequest|sendBeacon|serviceWorker/);
    assert.match(html, /connect-src 'none'/); assert.match(html, /form-action 'none'/); assert.doesNotMatch(html, /type="module"/);
  });
  test('all IDs are unique and form labels resolve to actual controls', () => {
    const html = read('index.html'), ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const match of html.matchAll(/\bfor="([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Missing control: ${match[1]}`);
    for (const match of html.matchAll(/aria-(?:describedby|labelledby)="([^"]+)"/g)) for (const id of match[1].split(' ')) assert.ok(ids.includes(id), `Missing ARIA target: ${id}`);
  });
  test('interactive buttons are submit actions or have bound handlers', () => {
    const html = read('index.html'), app = read('app.js');
    for (const match of html.matchAll(/<button\b([^>]*)>/g)) {
      if (match[1].includes('type="submit"')) continue;
      const id = /id="([^"]+)"/.exec(match[1])?.[1]; assert.ok(id, 'Button must have an ID');
      assert.ok(app.includes(`$('${id}').addEventListener('click'`), `No behavior: ${id}`);
    }
  });
  test('gate points to runnable tests and demo and keeps independent release gates pending', () => {
    const gate = JSON.parse(read('buildsignal-gates.json'));
    assert.deepEqual(gate.test_files, ['tests/run.cjs']); assert.equal(gate.demo_file, 'demo/run.cjs');
    for (const file of [...gate.test_files, ...gate.test_support_files, gate.demo_file]) assert.ok(fs.statSync(path.join(root, file)).isFile());
    assert.deepEqual(gate.release.media, []); assert.equal(gate.release.visibility, 'private');
    assert.equal(gate.release.critique_round, 'completed_with_four_findings');
    assert.match(gate.release.final_rereview_round, /pending/);
    assert.equal(gate.release.independent_product_review, 'pending');
    assert.equal(gate.release.independent_release_review, 'pending');
    assert.match(gate.release.final_media, /deferred/);
  });
  test('demo is deterministic and produces two honest self-reported records', () => {
    const { runDemo, PAIRS } = require('../demo/run.cjs');
    const a = runDemo(); assert.equal(a, runDemo());
    const data = JSON.parse(a); assert.equal(data.attempts.length, 2);
    assert.equal(data.attempts[0].confidence, 'high'); assert.equal(data.attempts[0].selfCheck, 'partial');
    assert.equal(data.attempts[1].selfCheck, 'matched'); assert.match(data.grading, /no automatic/);
    // Prevent the example shown by the page drifting from the deterministic demo.
    const raw = /const EXAMPLE = '((?:\\.|[^'])*)';/.exec(read('app.js'))[1];
    const decoded = raw.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    assert.equal(decoded, PAIRS);
  });
};
