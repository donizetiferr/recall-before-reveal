/* Shared browser/Node domain logic. No I/O, network, model, or semantic grading. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Recall = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const LIMITS = Object.freeze({ input: 100000, cards: 50, question: 1000, reference: 4000, answer: 4000, note: 1000, attempts: 500, title: 80 });
  const CONFIDENCE = Object.freeze(['low', 'medium', 'high']);
  const CHECKS = Object.freeze(['matched', 'partial', 'missed']);
  function text(value, name, max, empty = false) {
    if (typeof value !== 'string' || value.length > max || (!empty && !value.trim())) throw new Error(`${name} must be ${empty ? 'at most' : '1–'}${max} characters${empty ? '' : ' and not blank'}.`);
    return value;
  }
  function parsePairs(input) {
    text(input, 'Question set', LIMITS.input);
    const lines = input.replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '').split('\n');
    const cards = [];
    let question = [], answer = [], section = null, start = 0;
    function flush() {
      if (section === null) return;
      const q = question.join('\n').trim(), a = answer.join('\n').trim();
      if (!q || !a || section !== 'answer') throw new Error(`Pair starting at line ${start} needs both Q: and A: with text.`);
      text(q, `Question at line ${start}`, LIMITS.question);
      text(a, `Reference at line ${start}`, LIMITS.reference);
      cards.push({ id: `q${cards.length + 1}`, question: q, reference: a });
      if (cards.length > LIMITS.cards) throw new Error(`Use at most ${LIMITS.cards} pairs in one set.`);
    }
    lines.forEach((line, i) => {
      if (/^Q:/.test(line)) {
        flush(); question = [line.slice(2).trimStart()]; answer = []; section = 'question'; start = i + 1;
      } else if (/^A:/.test(line)) {
        if (section !== 'question') throw new Error(`Unexpected A: at line ${i + 1}. Each pair needs one Q: followed by one A:.`);
        answer.push(line.slice(2).trimStart()); section = 'answer';
      } else if (section === 'question') question.push(line);
      else if (section === 'answer') answer.push(line);
      else if (line.trim()) throw new Error(`Line ${i + 1} must begin with Q:. Use uppercase Q: and A: at the start of a line.`);
    });
    flush();
    if (!cards.length) throw new Error('Add at least one Q: and A: pair.');
    return cards;
  }
  function createSession(input, title = 'Untitled practice') {
    return { schema: 1, title: text(title.trim() || 'Untitled practice', 'Title', LIMITS.title), cards: parsePairs(input), position: 0, round: 1, attempts: [], revealedAttemptId: null, draft: { answer: '', confidence: '' } };
  }
  function validateState(s) {
    if (!s || typeof s !== 'object' || Array.isArray(s) || s.schema !== 1) throw new Error('Unsupported saved practice.');
    text(s.title, 'Title', LIMITS.title);
    if (!Array.isArray(s.cards) || s.cards.length < 1 || s.cards.length > LIMITS.cards) throw new Error('Invalid saved question set.');
    const ids = new Set();
    s.cards.forEach((c, i) => {
      if (!c || c.id !== `q${i + 1}`) throw new Error('Invalid question ID.');
      ids.add(c.id); text(c.question, 'Question', LIMITS.question); text(c.reference, 'Reference', LIMITS.reference);
    });
    if (!Number.isInteger(s.position) || s.position < 0 || s.position > s.cards.length || !Number.isInteger(s.round) || s.round < 1 || s.round > LIMITS.attempts + 1) throw new Error('Invalid practice position.');
    if (!Array.isArray(s.attempts) || s.attempts.length > LIMITS.attempts) throw new Error('Invalid attempt history.');
    // Progress must be supported by the fixed-order history, not just fit numeric bounds.
    const expectedAttempts = (s.round - 1) * s.cards.length + s.position + (s.revealedAttemptId === null ? 0 : 1);
    if (s.attempts.length !== expectedAttempts) throw new Error('Saved progress does not match the attempt history.');
    s.attempts.forEach((a, i) => {
      const card = s.cards.find(c => c.id === a?.cardId);
      if (!a || a.id !== i + 1 || !ids.has(a.cardId) || a.question !== card.question || a.reference !== card.reference) throw new Error('Invalid saved attempt.');
      if (a.cardId !== s.cards[i % s.cards.length].id || a.round !== Math.floor(i / s.cards.length) + 1) throw new Error('Saved attempt order does not match the question sequence.');
      text(a.answer, 'Attempt', LIMITS.answer); text(a.note, 'Note', LIMITS.note, true);
      if (!CONFIDENCE.includes(a.confidence) || (a.selfCheck !== null && !CHECKS.includes(a.selfCheck))) throw new Error('Invalid self-report.');
      if (!Number.isInteger(a.round) || a.round < 1 || a.round > s.round || typeof a.revealedAt !== 'string' || !Number.isFinite(Date.parse(a.revealedAt))) throw new Error('Invalid attempt metadata.');
    });
    if (s.revealedAttemptId !== null) {
      const a = s.attempts.at(-1);
      if (!a || a.id !== s.revealedAttemptId || a.cardId !== s.cards[s.position]?.id || a.round !== s.round) throw new Error('Invalid revealed answer.');
    }
    if (!s.draft || typeof s.draft !== 'object') throw new Error('Invalid answer draft.');
    text(s.draft.answer, 'Draft', LIMITS.answer, true);
    if (!['', ...CONFIDENCE].includes(s.draft.confidence)) throw new Error('Invalid draft confidence.');
    // Whitelist every field. Unknown fields from storage never enter the application.
    return { schema: 1, title: s.title, cards: s.cards.map(c => ({ id: c.id, question: c.question, reference: c.reference })), position: s.position, round: s.round, attempts: s.attempts.map(a => ({ id: a.id, cardId: a.cardId, question: a.question, reference: a.reference, answer: a.answer, confidence: a.confidence, revealedAt: a.revealedAt, selfCheck: a.selfCheck, note: a.note, round: a.round })), revealedAttemptId: s.revealedAttemptId, draft: { answer: s.draft.answer, confidence: s.draft.confidence } };
  }
  function recordAttempt(state, answer, confidence, now) {
    const s = validateState(state);
    if (s.revealedAttemptId !== null || s.position === s.cards.length) throw new Error('This question is already revealed or the round is complete.');
    if (s.attempts.length >= LIMITS.attempts) throw new Error('This set has 500 attempts. Export them, then start a new set.');
    text(answer, 'Your answer', LIMITS.answer);
    if (!CONFIDENCE.includes(confidence)) throw new Error('Choose your confidence before revealing.');
    if (typeof now !== 'string' || !Number.isFinite(Date.parse(now))) throw new Error('A valid reveal time is required.');
    const card = s.cards[s.position];
    const attempt = { id: s.attempts.length + 1, cardId: card.id, question: card.question, reference: card.reference, answer: answer.trim(), confidence, revealedAt: new Date(now).toISOString(), selfCheck: null, note: '', round: s.round };
    return { ...s, attempts: [...s.attempts, attempt], revealedAttemptId: attempt.id, draft: { answer: '', confidence: '' } };
  }
  function reflect(state, selfCheck, note) {
    const s = validateState(state);
    if (s.revealedAttemptId === null) throw new Error('Reveal your answer before comparing.');
    if (selfCheck !== null && !CHECKS.includes(selfCheck)) throw new Error('Choose a valid self-check.');
    text(note, 'Note', LIMITS.note, true);
    return { ...s, attempts: s.attempts.map(a => a.id === s.revealedAttemptId ? { ...a, selfCheck, note } : a) };
  }
  function nextQuestion(state) {
    const s = validateState(state);
    if (s.revealedAttemptId === null) throw new Error('Write an answer and reveal it before continuing.');
    return { ...s, position: s.position + 1, revealedAttemptId: null, draft: { answer: '', confidence: '' } };
  }
  function practiceAgain(state) {
    const s = validateState(state);
    if (s.position !== s.cards.length) throw new Error('Finish this round first.');
    if (s.attempts.length >= LIMITS.attempts) throw new Error('Export your attempts and start a new set.');
    return { ...s, position: 0, round: s.round + 1, revealedAttemptId: null, draft: { answer: '', confidence: '' } };
  }
  function exportJSON(state) {
    const s = validateState(state);
    return JSON.stringify({ format: 'recall-before-reveal/1', title: s.title, grading: 'Self-reported only; no automatic correctness evaluation.', cards: s.cards, attempts: s.attempts }, null, 2) + '\n';
  }
  return Object.freeze({ LIMITS, CONFIDENCE, CHECKS, parsePairs, createSession, validateState, recordAttempt, reflect, nextQuestion, practiceAgain, exportJSON });
});
