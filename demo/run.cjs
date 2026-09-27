'use strict';
// Deterministic synthetic scenario, not a user testimonial or a learning result.
const R = require('../core.js');
const PAIRS = 'Q: What details help an AI rewrite a message usefully?\nA: State the audience, the purpose, and the tone. Include the message and say what must stay unchanged.\n\nQ: What should you do before trusting an AI’s factual claim?\nA: Check important claims against a reliable source. A confident explanation is not evidence by itself.';
function runDemo() {
  let state = R.createSession(PAIRS, 'Everyday AI · example');
  state = R.recordAttempt(state, 'Tell it to make the message sound better.', 'high', '2026-01-01T12:00:00.000Z');
  state = R.reflect(state, 'partial', 'Add the audience, purpose, tone, and what must stay unchanged.');
  state = R.nextQuestion(state);
  state = R.recordAttempt(state, 'Check important facts with a reliable source, not the confident tone.', 'medium', '2026-01-01T12:01:00.000Z');
  state = R.reflect(state, 'matched', 'Confidence is not evidence.');
  state = R.nextQuestion(state);
  return R.exportJSON(state);
}
if (require.main === module) process.stdout.write(runDemo());
module.exports = { PAIRS, runDemo };
