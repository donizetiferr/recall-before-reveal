'use strict';
// A single-process, synchronous harness. No downloads, workers, or subprocesses.
const assert = require('node:assert/strict');
const { writeSync } = require('node:fs');
const { runCases } = require('./harness.cjs');
// Initialize Node's lazy stdio before guarding net.Socket (piped stdio uses it).
void process.stdout; void process.stderr;
function writeLine(fd, text) {
  const bytes = Buffer.from(text + '\n');
  let offset = 0;
  while (offset < bytes.length) {
    const written = writeSync(fd, bytes, offset, bytes.length - offset);
    if (written === 0) throw new Error('Output stream made no progress.');
    offset += written;
  }
}
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
try {
  for (const file of ['./core.test.cjs', './storage.test.cjs', './contract.test.cjs', './harness.test.cjs']) require(file)({ test, assert });
  const result = runCases(cases, line => writeLine(1, line), line => writeLine(2, line));
  process.exitCode = result.exitCode;
} catch {
  try { writeLine(2, 'HARNESS ERROR: test loading or output failed. Results are incomplete.'); } catch { /* Preserve failure exit status. */ }
  process.exitCode = 1;
}
