'use strict';
// A single-process, synchronous harness. No downloads, workers, or subprocesses.
const assert = require('node:assert/strict');
function blocked() { throw new Error('Network and child processes are disabled by the test harness.'); }
for (const name of ['node:http', 'node:https', 'node:net', 'node:tls', 'node:dgram', 'node:dns', 'node:child_process', 'node:worker_threads']) {
  const api = require(name);
  for (const key of Object.keys(api)) {
    if (typeof api[key] === 'function') {
      try { api[key] = blocked; } catch { /* Read-only bindings remain unused. */ }
    }
  }
}
globalThis.fetch = blocked;
if (globalThis.WebSocket) globalThis.WebSocket = blocked;
const cases = [];
const test = (name, fn) => cases.push({ name, fn });
for (const file of ['./core.test.cjs', './storage.test.cjs', './contract.test.cjs']) require(file)({ test, assert });
let failed = 0;
for (const { name, fn } of cases) {
  try {
    const result = fn();
    assert.ok(!result || typeof result.then !== 'function', 'This harness accepts only synchronous tests.');
    console.log(`PASS ${name}`);
  } catch (e) { failed++; console.error(`FAIL ${name}: ${e.message}`); }
}
console.log(`RESULT ${cases.length - failed}/${cases.length} passed; ${failed} failed. Network and child processes disabled.`);
process.exitCode = failed ? 1 : 0;
