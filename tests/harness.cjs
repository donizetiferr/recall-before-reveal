'use strict';
// Pure runner logic, with injected output sinks so broken logging is testable offline.
function runCases(cases, out, err) {
  let passed = 0, failed = 0, harnessFailed = false;
  function emit(sink, message) {
    try { sink(message); return true; }
    catch {
      harnessFailed = true;
      try { err('HARNESS ERROR: test output could not be written. Results are incomplete.'); } catch { /* Exit status still reports failure. */ }
      return false;
    }
  }
  for (const { name, fn } of cases) {
    let didFail = false, failure;
    try {
      const result = fn();
      if (result && typeof result.then === 'function') throw new Error('This harness accepts only synchronous tests.');
    } catch (error) { didFail = true; failure = error; }
    // Logging is outside the assertion catch: an output error is not a failed assertion.
    if (didFail) {
      failed++;
      if (!emit(err, `FAIL ${name}: ${failure?.message || String(failure)}`)) break;
    } else {
      passed++;
      if (!emit(out, `PASS ${name}`)) break;
    }
  }
  if (!harnessFailed) emit(out, `RESULT ${passed}/${cases.length} passed; ${failed} failed. Network and child processes disabled.`);
  return { passed, failed, harnessFailed, exitCode: failed || harnessFailed ? 1 : 0 };
}
module.exports = { runCases };
