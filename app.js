/* Plain-text UI. Local scripts only; never interpret pasted content as markup. */
(function () {
  'use strict';
  const R = window.Recall, S = window.RecallStorage;
  const $ = id => document.getElementById(id);
  const EXAMPLE = 'Q: What details help an AI rewrite a message usefully?\nA: State the audience, the purpose, and the tone. Include the message and say what must stay unchanged.\n\nQ: What should you do before trusting an AI’s factual claim?\nA: Check important claims against a reliable source. A confident explanation is not evidence by itself.';
  const labels = { low: 'Low', medium: 'Medium', high: 'High', matched: 'Got the main idea', partial: 'Missed something', missed: 'Need another look' };
  let storage;
  try { storage = window.localStorage; } catch { storage = null; }
  const restored = S.load(storage);
  let state = restored.state, remember = restored.saved, saved = restored.saved, editing = !state, saveTimer;
  $('remember').checked = remember;
  function notice(message) { $('notice').textContent = message; $('notice').hidden = !message; }
  function error(id, message, control) { $(id).textContent = message; $(id).hidden = !message; if (control) { $(control).setAttribute('aria-invalid', message ? 'true' : 'false'); if (message) $(control).focus(); } }
  let rejectedPaste = '';
  function editorHasDraft() { return $('pairs').value.length > 0 || $('set-title').value.length > 0; }
  function status() {
    $('storage-status').textContent = remember ? (saved ? 'Active practice saved locally, including your answer draft. No account or sync.' : 'Active practice not saved yet. Keep this tab open or export.') : 'Practice is tab-only. Export attempts before closing.';
    $('editor-status').hidden = !editorHasDraft();
    $('editor-status').textContent = editing
      ? 'Question-set editor: not saved. Copy this text before leaving. Starting practice applies it; browser saving only saves the active practice.'
      : 'Question-set editor: not saved. Your text is still in this tab. Choose Replace question set to return, and copy it before leaving.';
  }
  function persist() {
    clearTimeout(saveTimer);
    if (remember && state) { const result = S.save(storage, state); saved = result.saved; if (result.warning) notice(result.warning); }
    status();
  }
  function changed(later = false) {
    saved = false;
    if (later && remember) { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 180); status(); }
    else persist();
  }
  function focus(id) { $(id).focus(); }
  function selected(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value || ''; }
  function select(name, value) { document.querySelectorAll(`input[name="${name}"]`).forEach(el => { el.checked = el.value === value; }); }
  function node(tag, value, className) { const el = document.createElement(tag); if (value !== undefined) el.textContent = value; if (className) el.className = className; return el; }
  function history() {
    const attempts = state?.attempts || [];
    $('attempt-count').textContent = String(attempts.length);
    $('history-empty').hidden = attempts.length > 0;
    $('export').disabled = attempts.length === 0;
    $('history').replaceChildren();
    // Keep a large log manageable; every attempt remains in the JSON export.
    attempts.slice(-20).reverse().forEach(a => {
      const detail = node('details');
      detail.append(node('summary', `#${a.id} · Round ${a.round} · ${labels[a.confidence]} confidence — ${a.question}`));
      const body = node('div', undefined, 'history-entry');
      [['Your locked answer', a.answer], ['Your reference', a.reference], ['Your self-check', a.selfCheck ? labels[a.selfCheck] : 'Not recorded'], ['Your note', a.note || 'No note'], ['Revealed at', a.revealedAt]].forEach(([label, value]) => { body.append(node('strong', label), node('p', value)); });
      detail.append(body); $('history').append(detail);
    });
    if (attempts.length > 20) $('history').append(node('p', 'Showing the latest 20 attempts. Export includes all attempts.', 'hint'));
  }
  function render() {
    $('set-form').hidden = !editing;
    $('set-loaded').hidden = editing || !state;
    $('cancel-edit').hidden = !state;
    $('empty-state').hidden = !!state;
    $('question-view').hidden = !state || state.position === state.cards.length;
    $('complete').hidden = !state || state.position < state.cards.length;
    $('progress-label').textContent = '';
    if (state) {
      $('loaded-title').textContent = state.title;
      $('loaded-count').textContent = `${state.cards.length} question${state.cards.length === 1 ? '' : 's'} · Round ${state.round}`;
      $('progress-label').textContent = state.position < state.cards.length ? `${state.position + 1} of ${state.cards.length}` : `${state.cards.length} of ${state.cards.length}`;
      if (state.position < state.cards.length) {
        const card = state.cards[state.position], attempt = state.revealedAttemptId === null ? null : state.attempts.at(-1);
        $('progress').max = state.cards.length; $('progress').value = state.position;
        $('question').textContent = card.question;
        $('answer').value = attempt ? attempt.answer : state.draft.answer;
        $('answer').readOnly = !!attempt;
        $('confidence-field').disabled = !!attempt;
        select('confidence', attempt ? attempt.confidence : state.draft.confidence);
        $('reveal').disabled = !!attempt;
        $('reveal').textContent = attempt ? 'Answer recorded' : 'Record & reveal ↗';
        $('comparison').hidden = !attempt;
        // Never leave the previous reference in the DOM when moving to a new card.
        $('reference').textContent = attempt ? attempt.reference : '';
        $('recorded-meta').textContent = attempt ? `Recorded before reveal · ${labels[attempt.confidence]} confidence` : '';
        select('self-check', attempt?.selfCheck || '');
        $('note').value = attempt?.note || '';
        $('next').textContent = state.position + 1 === state.cards.length ? 'Finish round →' : 'Next question →';
      } else {
        $('reference').textContent = ''; $('answer').value = ''; $('note').value = '';
        $('completion-text').textContent = `${state.cards.length} question${state.cards.length === 1 ? '' : 's'} attempted this round. ${state.attempts.length} attempt${state.attempts.length === 1 ? '' : 's'} in your log.`;
        $('review-list').replaceChildren();
        state.attempts.filter(a => a.round === state.round).forEach(a => {
          const item = node('div', undefined, 'review-item');
          item.append(node('strong', a.question), node('small', `${labels[a.confidence]} confidence → ${a.selfCheck ? labels[a.selfCheck] : 'No self-check yet'}`));
          if (a.confidence === 'high' && (a.selfCheck === 'partial' || a.selfCheck === 'missed')) item.append(node('small', 'A useful one to revisit: you felt sure, then noticed a gap.'));
          if (a.note) item.append(node('p', a.note));
          $('review-list').append(item);
        });
      }
    }
    status(); history();
  }
  function editorChanged() {
    rejectedPaste = '';
    const tooLong = $('pairs').value.length > R.LIMITS.input;
    error('set-error', tooLong ? 'Question set is too long. Use at most 100,000 total characters. Nothing has been applied or shortened.' : '');
    $('pairs').setAttribute('aria-invalid', String(tooLong));
    status();
  }
  $('set-title').addEventListener('input', status);
  $('pairs').addEventListener('input', editorChanged);
  $('pairs').addEventListener('paste', e => {
    if (!e.clipboardData) return; // The full input is still validated without native maxlength.
    const inserted = e.clipboardData.getData('text/plain').replace(/\r\n?/g, '\n');
    const field = $('pairs');
    const length = field.value.length - (field.selectionEnd - field.selectionStart) + inserted.length;
    if (length > R.LIMITS.input) {
      e.preventDefault();
      rejectedPaste = 'Paste not inserted: it would exceed 100,000 total characters. Your previous editor text is unchanged. Shorten the paste or edit the text before starting.';
      error('set-error', rejectedPaste, 'pairs');
    }
  });
  function start() {
    if (rejectedPaste) { error('set-error', rejectedPaste, 'pairs'); return; }
    let candidate;
    try { candidate = R.createSession($('pairs').value, $('set-title').value); }
    catch (e) { error('set-error', e.message, 'pairs'); return; }
    if (state && !window.confirm('Replace this set and its attempt log? Export first to keep a copy. Cancel to return without losing anything.')) return;
    state = candidate; editing = false;
    $('pairs').value = ''; $('set-title').value = '';
    error('set-error', '', 'pairs'); error('attempt-error', '', 'answer'); notice(''); changed(); render(); focus('question');
  }
  $('set-form').addEventListener('submit', e => { e.preventDefault(); start(); });
  $('example').addEventListener('click', () => {
    if (editorHasDraft() && !window.confirm('Replace the title and text in the editor with the example? Your active practice is unchanged until you start.')) return;
    $('set-title').value = 'Everyday AI · example'; $('pairs').value = EXAMPLE;
    editorChanged(); error('set-error', '', 'pairs'); focus('pairs');
    notice('Example loaded. These are synthetic practice questions, not your personal results. Select Start practicing.');
  });
  $('replace-set').addEventListener('click', () => { editing = true; render(); focus('set-title'); });
  $('cancel-edit').addEventListener('click', () => { editing = false; render(); focus(state.position < state.cards.length ? 'question' : 'complete-heading'); });
  $('answer').addEventListener('input', () => {
    if (!state || state.revealedAttemptId !== null) return;
    state.draft.answer = $('answer').value; error('attempt-error', ''); $('answer').removeAttribute('aria-invalid'); changed(true);
  });
  document.querySelectorAll('input[name="confidence"]').forEach(el => el.addEventListener('change', () => {
    if (!state || state.revealedAttemptId !== null) return;
    state.draft.confidence = selected('confidence'); changed();
  }));
  $('attempt-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!state) return;
    try { state = R.recordAttempt(state, $('answer').value, selected('confidence'), new Date().toISOString()); }
    catch (e) { error('attempt-error', e.message, $('answer').value.trim() ? null : 'answer'); if ($('answer').value.trim() && !selected('confidence')) document.querySelector('input[name="confidence"]').focus(); return; }
    error('attempt-error', '', 'answer'); notice(''); changed(); render(); focus('reference-heading');
  });
  function reflection() {
    if (!state || state.revealedAttemptId === null) return;
    try { state = R.reflect(state, selected('self-check') || null, $('note').value); changed(true); history(); }
    catch (e) { notice(e.message); }
  }
  document.querySelectorAll('input[name="self-check"]').forEach(el => el.addEventListener('change', reflection));
  $('note').addEventListener('input', reflection);
  $('next').addEventListener('click', () => {
    try { state = R.nextQuestion(state); changed(); render(); focus(state.position < state.cards.length ? 'question' : 'complete-heading'); }
    catch (e) { notice(e.message); }
  });
  $('again').addEventListener('click', () => {
    try { state = R.practiceAgain(state); changed(); render(); focus('question'); }
    catch (e) { notice(e.message); }
  });
  $('remember').addEventListener('change', () => {
    if ($('remember').checked) { remember = true; notice(''); changed(); }
    else {
      const result = S.clear(storage);
      if (!result.cleared) { $('remember').checked = remember; notice(result.warning); return; }
      remember = false; saved = false; clearTimeout(saveTimer); notice('Local copy removed. This tab still contains your practice.'); status();
    }
  });
  $('forget').addEventListener('click', () => {
    if (!window.confirm('Forget this practice, its draft, and its saved browser copy? Export attempts first to keep them.')) return;
    const result = S.clear(storage);
    if (!result.cleared) { notice(result.warning); return; }
    clearTimeout(saveTimer); state = null; remember = false; saved = false; editing = true; rejectedPaste = '';
    $('remember').checked = false; $('pairs').value = ''; $('set-title').value = ''; $('reference').textContent = ''; $('answer').value = ''; $('note').value = ''; $('review-list').replaceChildren();
    error('set-error', '', 'pairs'); error('attempt-error', '', 'answer'); render(); notice('Practice removed from this tab and its saved browser copy. Downloaded exports are not deleted.'); focus('pairs');
  });
  $('export').addEventListener('click', () => {
    if (!state?.attempts.length) return;
    let url;
    try {
      persist(); const data = R.exportJSON(state);
      url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'recall-attempts.json'; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notice('JSON download requested. Check your downloads before closing or replacing this practice.');
    } catch { if (url) URL.revokeObjectURL(url); notice('Download could not start. Your attempts are still in this tab. Try saving locally or another browser.'); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
  window.addEventListener('beforeunload', e => {
    persist();
    // Editor text is intentionally tab-only, even when the active practice is saved.
    if (editorHasDraft() || (state && !saved)) { e.preventDefault(); e.returnValue = ''; }
  });
  render();
  if (restored.warning) notice(storage ? restored.warning : 'Browser storage is unavailable. Tab-only practice and JSON export still work.');
})();
