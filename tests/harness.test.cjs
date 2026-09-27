'use strict';
const { runCases } = require('./harness.cjs');
module.exports = ({ test, assert }) => {
  const good = { name: 'synthetic passing case', fn() {} };
  test('harness separates assertion failures from successful output', () => {
    const out = [], err = [];
    const result = runCases([good, { name: 'synthetic failing case', fn() { throw new Error('expected assertion'); } }], x => out.push(x), x => err.push(x));
    assert.deepEqual(result, { passed: 1, failed: 1, harnessFailed: false, exitCode: 1 });
    assert.match(out.at(-1), /RESULT 1\/2 passed; 1 failed/);
    assert.match(err[0], /FAIL synthetic failing case/);
  });
  test('stdout failure is a harness failure, not a false assertion failure', () => {
    const err = [];
    const result = runCases([good], () => { throw new Error('closed output'); }, x => err.push(x));
    assert.deepEqual(result, { passed: 1, failed: 0, harnessFailed: true, exitCode: 1 });
    assert.match(err[0], /^HARNESS ERROR/);
    assert.ok(err.every(x => !x.startsWith('FAIL')));
  });
  test('both output sinks failing still yields a failing exit status', () => {
    const fail = () => { throw new Error('closed output'); };
    const result = runCases([good], fail, fail);
    assert.equal(result.exitCode, 1); assert.equal(result.harnessFailed, true); assert.equal(result.failed, 0);
  });
  test('failure to write final summary cannot report success', () => {
    const err = [];
    const result = runCases([good], x => { if (x.startsWith('RESULT')) throw new Error('summary write failed'); }, x => err.push(x));
    assert.equal(result.exitCode, 1); assert.equal(result.passed, 1); assert.match(err[0], /^HARNESS ERROR/);
  });
  test('falsy thrown values are still failed test cases', () => {
    for (const value of [null, undefined, false, 0, '']) {
      const result = runCases([{ name: 'synthetic thrown value', fn() { throw value; } }], () => {}, () => {});
      assert.equal(result.failed, 1); assert.equal(result.exitCode, 1);
    }
  });
  test('asynchronous cases are refused without starting a worker', () => {
    const result = runCases([{ name: 'synthetic thenable', fn: () => ({ then() {} }) }], () => {}, () => {});
    assert.equal(result.failed, 1); assert.equal(result.exitCode, 1);
  });
  test('stdio initialization does not reopen denied network or subprocess APIs', () => {
    assert.ok(process.stdout && process.stderr);
    assert.throws(() => new (require('node:net').Socket)(), /disabled/);
    assert.throws(() => require('node:https').request({}), /disabled/);
    assert.throws(() => new (require('node:worker_threads').Worker)('unused'), /disabled/);
    assert.throws(() => require('node:child_process').exec('unused'), /disabled/);
  });
};
