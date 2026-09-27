# Recall Before Reveal

**Try the answer. Then take a look.**

A small, model-free practice page for people who read AI explanations and want to check what they can actually say without looking. Bring your own question-and-answer pairs, write a response, choose confidence, reveal the reference, and export the record.

Private review candidate. All three requested quality rounds are complete; independent product review and release review are still pending. See `docs/review.md` for the final re-review, the saved-progress consistency fix, current regression results, and residual limits. Earlier findings and fixes remain in `docs/improvements.md`. No final promotional media has been generated.

## Use it offline

Open `index.html` in a modern desktop browser. Keep `styles.css`, `core.js`, `storage.js`, and `app.js` beside it. There is no installation, bundler, server, account, model, or internet requirement. The app also works as ordinary static files served locally. It does not install a service worker or promise that a hosted URL remains available offline after a reload.

1. Paste a set, or select **Try a 2-question example**, then **Start practicing**.
2. Write an answer from memory and choose Low, Medium, or High confidence. There is no preselected confidence. “I don’t know yet” is a valid answer.
3. Select **Record & reveal**. The response and confidence are locked. Compare the reference yourself; optionally choose a self-check and write a note.
4. Continue through the set, then export JSON or practice it again. Earlier attempts remain in the log.

Every control works with standard keyboard navigation. Radio groups support native keyboard selection. Focus moves to the question or reference heading after navigation. The responsive layout is intended for narrow screens, although mobile operating systems vary in how they open local HTML files and save downloads. Browser automation is not a physical-device test.

## Paste format

```text
Q: What details help an AI rewrite a message usefully?
A: State the audience, the purpose, and the tone. Include the message and say what must stay unchanged.

Q: What should you do before trusting an AI’s factual claim?
A: Check important claims against a reliable source. A confident explanation is not evidence by itself.
```

Use uppercase `Q:` and `A:` at the start of separate lines. Text may span multiple lines and include blank lines. A line starting with either marker is structural; do not use an unescaped leading marker as ordinary reference text. Leading spaces before markers are not accepted as new markers. Plain text is displayed literally, including HTML-like text. There is no Markdown interpreter.

Limits: 50 pairs, 100,000 input characters, 1,000 characters per question, 4,000 per reference or attempt, 1,000 per note, and 500 attempts per set. Counts use JavaScript string length (UTF-16 code units). An oversized paste is refused without shortening it or replacing the previous editor text. Edit the text or paste a smaller set to recover. If a browser insertion bypasses the paste handler, the full oversized buffer remains visible but cannot start practice. Individual question/reference limits still apply. A malformed import is refused without replacing your active practice. Replacement and forgetting require confirmation. Export first to preserve attempts before replacing a set.

## Your data

By default the active set and attempts stay only in the current tab. **Save on this browser** enables local storage for the active practice, including its current answer draft. It does **not** save unstarted text in the question-set editor. That editor has a separate **not saved** message. **Back to current practice** hides the editor without deleting its text; open **Replace question set** to return. Copy unstarted editor text before leaving. Reloading or leaving with unsaved work requests a browser confirmation; choosing to leave discards tab-only data. Browsers can suppress that prompt, so it is a safety net, not a backup (see the browser reference in `docs/improvements.md`).

Turning browser saving off requests removal of this app’s saved key while keeping the tab. **Forget practice** clears the tab only after removal of that key has been confirmed by reading it back as absent. If access, removal, or readback fails, the page reports **removal could not be confirmed**, retains the current tab, and directs you to browser settings. It never claims that inaccessible data was deleted. These controls do not remove other applications’ data or downloaded exports, and do not promise secure erasure.

Local storage is not encrypted, is tied to the browser and origin, and may be blocked, evicted, or cleared. Local-file storage behavior also varies by browser. A save failure is reported; it does not erase the current practice or pretend the old saved copy is current. Saved position, round, and attempt order must agree with the recorded history. Inconsistent or corrupt saved data is not loaded, silently repaired, or automatically replaced. Export regularly. Use a single tab for a saved set: concurrent-tab conflict resolution and cross-device sync are not implemented.

The export is `recall-attempts.json`, a readable `recall-before-reveal/1` document. It contains the title, question set, each locked answer and confidence, reference snapshot, optional self-check and note, round number, and reveal timestamp. The latest 20 attempts are expandable in the UI; export contains all attempts. Exports are not imported back into the app in this version. A download request is not confirmation that the browser saved the file: check your downloads.

Do not paste secrets or sensitive personal information on shared devices. The page makes no network requests, has no tracking, and uses no remote scripts, fonts, or model calls. A Content Security Policy blocks connections and inline script execution. This is not a secure exam environment: references are supplied locally, and a person with developer tools can inspect or edit local data.

## What it does not claim

There is no semantic grading, question generation, correctness score, mastery score, spaced-repetition scheduler, or claim of improved learning outcomes. Confidence is self-reported. A self-check is the user’s judgment, not a model’s verdict. Your supplied reference may itself be incomplete or wrong. The example and deterministic demo are synthetic, not real user experiences.

## Development and tests

Node 22 or later is required for the CLI tests and demo, not for browser use. There are no runtime or development dependencies to install.

```sh
node tests/run.cjs
node demo/run.cjs
```

The test runner loads assertion suites in one process and blocks network, worker, and child-process APIs. It initializes standard output/error before installing those guards and reports output failures separately from assertion failures. It does not use `node --test` process isolation, download packages, start browsers, or write test output files; it writes results to standard output/error. The guards cover these trusted tests, not arbitrary hostile code. Node’s additional permission guard was also exercised on the observed Node 24 runtime:

```sh
node --permission --allow-fs-read=. tests/run.cjs
```

The guard flag is version-dependent; the first two commands are the portable project commands. No browser launch is part of the safe test gate. Browser verification uses separately installed tooling in an isolated evidence directory and is documented in `docs/evidence.md`.

`demo/run.cjs` uses the same core logic as the UI, with fixed synthetic timestamps. It prints two attempts: one high-confidence answer self-marked as incomplete, followed by a medium-confidence answer self-marked as capturing the main idea. It does not infer either judgment. Repeated runs emit identical JSON bytes.

## Structure

- `index.html`, `styles.css`, `app.js`: accessible forms, responsive layout, and plain-text DOM rendering.
- `core.js`, `storage.js`: shared validation/state transitions and fallible local persistence.
- `tests/`, `demo/`: the single-process assertion gate and deterministic scenario.
- `buildsignal-gates.json`, `docs/`: executable gate references, differentiation, limitations, and review handoff.

MIT licensed. See `LICENSE`.
