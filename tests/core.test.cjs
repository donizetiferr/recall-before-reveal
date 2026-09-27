'use strict';
const R = require('../core.js');
const pairs = 'Q: What is the task?\nA: Rewrite the note.\n\nQ: Who is it for?\nA: A new teammate.';
const time = '2026-01-01T12:00:00.000Z';
const fresh = () => R.createSession(pairs, 'Synthetic practice');
module.exports = ({ test, assert }) => {
  test('parses Q/A blocks, CRLF, BOM, and multiline text', () => {
    const cards = R.parsePairs('\uFEFFQ: One?\r\nMore?\r\nA: First.\r\n\r\nSecond.\r\nQ: Two?\r\nA: Last.');
    assert.deepEqual(cards, [{ id: 'q1', question: 'One?\nMore?', reference: 'First.\n\nSecond.' }, { id: 'q2', question: 'Two?', reference: 'Last.' }]);
  });
  for (const [name, input] of [['empty', ''], ['unlabeled', 'A question'], ['orphan answer', 'A: Answer'], ['missing answer', 'Q: Question'], ['empty question', 'Q:\nA: Answer'], ['empty reference', 'Q: Question\nA:'], ['duplicate A marker', 'Q: Q\nA: A\nA: Other'], ['lowercase labels', 'q: Q\na: A']]) {
    test(`rejects ${name}`, () => assert.throws(() => R.parsePairs(input)));
  }
  test('reports the line of a malformed pair', () => assert.throws(() => R.parsePairs('Q: Fine\nA: Yes\nQ: Missing'), /line 3/));
  test('enforces input, card, question, and reference limits', () => {
    assert.throws(() => R.parsePairs('x'.repeat(R.LIMITS.input + 1)));
    assert.equal(R.parsePairs(Array.from({ length: 50 }, () => 'Q: Q\nA: A').join('\n')).length, 50);
    assert.throws(() => R.parsePairs(Array.from({ length: 51 }, () => 'Q: Q\nA: A').join('\n')));
    assert.throws(() => R.parsePairs('Q: ' + 'q'.repeat(1001) + '\nA: A'));
    assert.throws(() => R.parsePairs('Q: Q\nA: ' + 'a'.repeat(4001)));
  });
  test('preserves hostile markup as literal data', () => {
    const q = '<img src=x onerror=alert(1)>', a = '<script>throw 1</script>';
    assert.deepEqual(R.parsePairs(`Q: ${q}\nA: ${a}`)[0], { id: 'q1', question: q, reference: a });
  });
  test('requires nonblank answer and explicit valid confidence', () => {
    for (const answer of ['', '  ', null, 42, 'a'.repeat(4001)]) assert.throws(() => R.recordAttempt(fresh(), answer, 'high', time));
    for (const confidence of ['', null, 0, 'certain']) assert.throws(() => R.recordAttempt(fresh(), 'My answer', confidence, time));
  });
  test('cannot advance or reflect before reveal', () => {
    assert.throws(() => R.nextQuestion(fresh())); assert.throws(() => R.reflect(fresh(), 'matched', ''));
  });
  test('records exact answer, reference snapshot, confidence, time, and round', () => {
    const s = R.recordAttempt(fresh(), '  My answer  ', 'high', time);
    assert.deepEqual(s.attempts[0], { id: 1, cardId: 'q1', question: 'What is the task?', reference: 'Rewrite the note.', answer: 'My answer', confidence: 'high', revealedAt: time, selfCheck: null, note: '', round: 1 });
    assert.equal(s.revealedAttemptId, 1);
  });
  test('record operation does not mutate the original state or draft', () => {
    const original = fresh(); original.draft.answer = 'Draft'; const before = JSON.stringify(original);
    R.recordAttempt(original, 'Answer', 'low', time); assert.equal(JSON.stringify(original), before);
  });
  test('repeated reveal cannot duplicate an attempt', () => {
    const s = R.recordAttempt(fresh(), 'Answer', 'low', time);
    assert.throws(() => R.recordAttempt(s, 'Changed answer', 'high', time)); assert.equal(s.attempts.length, 1);
  });
  test('reflection can change only self-check and note, not the locked answer', () => {
    const s = R.recordAttempt(fresh(), 'Answer', 'medium', time), updated = R.reflect(s, 'partial', 'Add context.');
    assert.equal(s.attempts[0].selfCheck, null); assert.equal(updated.attempts[0].answer, 'Answer');
    assert.equal(updated.attempts[0].confidence, 'medium'); assert.equal(updated.attempts[0].note, 'Add context.');
    assert.throws(() => R.reflect(s, 'automatic-pass', '')); assert.throws(() => R.reflect(s, null, 'x'.repeat(1001)));
  });
  test('next question resets draft and reveal but retains all recorded attempts', () => {
    const s = R.nextQuestion(R.recordAttempt(fresh(), 'Answer', 'high', time));
    assert.equal(s.position, 1); assert.equal(s.revealedAttemptId, null); assert.deepEqual(s.draft, { answer: '', confidence: '' }); assert.equal(s.attempts.length, 1);
  });
  test('completion and second round retain earlier attempts and increase round', () => {
    let s = fresh();
    for (let i = 0; i < 2; i++) s = R.nextQuestion(R.recordAttempt(s, 'Answer', 'low', time));
    assert.equal(s.position, 2); assert.throws(() => R.recordAttempt(s, 'Answer', 'low', time));
    s = R.practiceAgain(s); assert.equal(s.round, 2); assert.equal(s.position, 0); assert.equal(s.attempts.length, 2);
    s = R.recordAttempt(s, 'New answer', 'high', time); assert.equal(s.attempts[2].round, 2); assert.equal(s.attempts[0].answer, 'Answer');
  });
  test('cannot restart an unfinished round', () => assert.throws(() => R.practiceAgain(fresh())));
  test('export is deterministic, parseable, and contains no inferred score', () => {
    const s = R.reflect(R.recordAttempt(fresh(), 'Answer', 'high', time), 'partial', 'A gap');
    const a = R.exportJSON(s); assert.equal(a, R.exportJSON(s));
    const data = JSON.parse(a); assert.equal(data.format, 'recall-before-reveal/1'); assert.deepEqual(data.attempts, s.attempts);
    assert.ok(!('score' in data)); assert.ok(!('accuracy' in data)); assert.match(data.grading, /Self-reported/);
  });
  test('saved-state validator discards unknown fields', () => {
    const s = fresh(); s.secretExtra = 'do not retain'; s.cards[0].other = true;
    assert.ok(!('secretExtra' in R.validateState(s))); assert.ok(!('other' in R.validateState(s).cards[0]));
  });
  test('saved-state validator rejects corrupt bounds and references', () => {
    for (const [key, value] of [['schema', 2], ['position', -1], ['position', 3], ['round', 0], ['cards', []], ['revealedAttemptId', 99], ['draft', null], ['title', '']]) {
      const s = fresh(); s[key] = value; assert.throws(() => R.validateState(s));
    }
    const s = R.recordAttempt(fresh(), 'Answer', 'low', time); s.attempts[0].reference = 'Rewritten'; assert.throws(() => R.validateState(s));
  });
  test('requires a valid explicit timestamp', () => {
    for (const t of ['', null, 123, 'not a date']) assert.throws(() => R.recordAttempt(fresh(), 'Answer', 'low', t));
  });
  test('500-attempt boundary refuses further recording without erasing history', () => {
    let s = R.createSession('Q: Q\nA: A');
    for (let i = 0; i < 500; i++) { s = R.nextQuestion(R.recordAttempt(s, 'Answer', 'low', time)); if (i < 499) s = R.practiceAgain(s); }
    assert.equal(s.attempts.length, 500); assert.throws(() => R.practiceAgain(s)); assert.equal(JSON.parse(R.exportJSON(s)).attempts.length, 500);
  });
};
