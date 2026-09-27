# Round-three product re-review

Observed on 2026-09-27. This is the separately requested **quality round 3 of 3**, not an independent final product review, a release decision, or a learning-outcome study. The reviewed input was `60ae4ef629d276daa30c401c557cf075819f231f`. Local HEAD, remote main, ownership, private visibility, and the GitHub reference API were reconciled before work. All exercises used synthetic data. The repository remains private and final media remains empty.

## Fresh execution of the improved product

The input commit was exercised again rather than accepted from earlier printed results: 52 safe tests, the 39-assertion baseline browser journey, and the 42-assertion targeted journey all passed. Original round-two evidence was not replaced. Fresh round-three artifacts bind their observations to the actual application source hashes.

R1-01 through R1-04 were rechecked: failed or inaccessible storage never claims deletion; successful removal reads back the key as absent and preserves unrelated keys; output-adapter checks preserve the real Node exit status; native clipboard size boundaries refuse truncation; and dirty question-set editors remain clearly separate from saved practice, including native reload cancellation and confirmation. Previously locked answers and reflections were present during the negative import/draft checks, not just an empty log.

## Remaining material gap found and fixed: R3-01

The saved-state validator checked individual bounds, but not whether the recorded history supported the declared progress. A fresh two-question synthetic state with no attempts was edited to `position: 2` and stored in the normal envelope. Reloading the input commit displayed **2 questions attempted this round. 0 attempts in your log.** without a warning. This was a deliberately inconsistent local-data fixture, not observed damage to a real person's work or a secure-exam exploit.

The fix requires the attempt count to agree with completed rounds, current position, and reveal status. Each record must also match the fixed question order and its corresponding round. Inconsistent data is refused by the existing load-warning path and remains untouched in storage. No automatic repair, invented attempt, destructive migration, new data format, or semantic grading was added.

Regression evidence was collected before the fix: three newly added tests failed, giving **53/56 passed, 3 failed, Node exit 1**. The browser reproduction also recorded the false completion. After the fix, all 56 tests pass. The same browser data is no longer presented as completed; the empty/error state is shown, and the original saved bytes are unchanged. Additional tests round-trip valid generated states at every transition across one-, two-, three-, and fifty-question sets. The pre-existing 500-attempt boundary still passes. Tests also reject reordered records, phantom rounds, and a hidden reveal marker inconsistent with the attempt count.

The change is deliberately limited to validating consistency. It does not authenticate locally editable records, verify semantic correctness, or detect every possible alteration that remains structurally consistent.

## Final checks after the fix

Run these commands from the repository root. Node observed: `v24.16.0`. No packages were installed.

| Exact command or output-adapter check | Result |
| --- | --- |
| `node tests/run.cjs` | 56/56 passed, 0 failed; Node exit 0. |
| `node --permission --allow-fs-read=. tests/run.cjs` | Same 56 tests; exit 0. |
| `node tests/run.cjs > "$EVIDENCE_DIR/final-unit-file.log" 2>&1` | Complete result stream; exit 0. |
| `node tests/run.cjs \| cat > "$EVIDENCE_DIR/final-unit-pipe.log"` | Node and consumer exits 0, 0. |
| `node tests/run.cjs 2>&1 \| cat > "$EVIDENCE_DIR/final-unit-combined.log"` | Node and consumer exits 0, 0. |
| `node --permission --allow-fs-read=. tests/run.cjs 2>&1 \| cat > "$EVIDENCE_DIR/final-unit-guarded-combined.log"` | Node and consumer exits 0, 0. |
| `script -q -e -c 'node tests/run.cjs' /dev/null` | Real pseudo-terminal: exit 0. |
| `script -q -e -c 'node --permission --allow-fs-read=. tests/run.cjs' /dev/null` | Guarded pseudo-terminal: exit 0. |
| `node --check core.js` and `node --check app.js` | Both exited 0. |
| `git diff --check` | No reported whitespace errors. |

The pipeline statuses were captured with `PIPESTATUS`. File and pipe streams were byte-identical; terminal output matched after removing terminal carriage returns. Assertions for broken output sinks, denied network/worker/process APIs, and synchronous test cases remain enabled. These are safeguards for trusted project tests, not an arbitrary-code sandbox. The safe test process starts no child processes or network calls; `script`, `cat`, and browser execution are separate external validation tools.

The final browser reruns passed **39 baseline assertions**, **42 targeted assertions**, and **14 additional review assertions**. All three bounded launchers returned exit 0. Each final report recorded no page JavaScript errors and no HTTP(S) page requests. These are overlapping validation scopes, not an accuracy or efficacy metric.

The baseline covers empty and malformed-input states, keyboard navigation and focus, explicit confidence, reference hiding, locked attempts, self-checks and notes, a real parsed JSON download, saving/restoration, forgetting, round completion, and repeated practice. Targeted regressions use native clipboard and reload actions for the four critique findings and test widths 320, 360, 390, 640, 641, 768, 1024, and 1360 without horizontal document overflow. The final additional journey checks inconsistent saved progress, native CRLF/Unicode paste, keyboard reveal with a multiline answer, simulated download failure followed by a successful real download, and restoration/export of 21 records while the UI intentionally displays only the latest 20.

### Browser execution and evidence location

The actual `index.html` was loaded from local files with offline browser contexts and the Chrome sandbox enabled. Desktop viewport: 1360 by 980; mobile viewport: 390 by 844. Existing browser-test tooling was used without adding a runtime dependency. Each test process had a 256-task ceiling, 1 GiB memory ceiling, two-CPU quota, and 180-second runtime ceiling. No existing service or production policy was modified.

The following launch pattern was executed with resolved private aliases; the extra harness takes `before` or `after` explicitly. Aliases stand for this job directory, its operational harnesses, the installed browser-test interpreter, and a new temporary-unit name. Export the aliases before running the pattern:

```sh
systemd-run --user --quiet --pipe --wait --collect \
  --unit="$TEST_UNIT" \
  --property=TasksMax=256 --property=MemoryMax=1G \
  --property=CPUQuota=200% --property=RuntimeMaxSec=180 \
  --working-directory="$JOB_DIR" \
  /usr/bin/env PYTHONDONTWRITEBYTECODE=1 "$BROWSER_PYTHON" "$BROWSER_HARNESS"
```

Relative to the assigned job directory, operational harnesses are `ops/check-ui-q3-8e3c7703.py`, `ops/check-q3-8e3c7703.py`, and `ops/check-q3-extra-8e3c7703.py`. Reports and logs are in `ops/q3-8e3c7703/`. Current reports are `final-baseline/browser-report.json`, `final-targeted/browser-report.json`, and `extra-after/report.json`; before-fix reproduction and negative-test results are retained separately. These operational files are not shipped in the repository or hidden inside the safe test gate.

## Visual review, demonstration, and media

Seven newly captured states were actually opened for visual inspection: desktop revealed practice; mobile empty and revealed practice; desktop paste refusal; mobile unsaved editor; inconsistent saved-progress warning; and mobile Unicode export. Controls, text, focus styling, and warnings were readable without visible clipping in those images. There are eleven source-bound final-pass **preliminary test screenshots** across the three reports, not eleven approved publication assets. No physical mobile device or continuous human-use session is claimed.

The original synthetic two-question demo is still useful and was not replaced merely to manufacture a new demonstration. `node demo/run.cjs` emits the same bytes across repeated runs and before/after this fix. SHA-256: `ddc8516967fb6315269ec3693731ba48547d5b6802280f08c6fe97acd3f1ab9e`. Questions, reference snapshots, pre-reveal confidence, later self-checks, notes, and format remain unchanged. This is an actual deterministic software output, not a claimed real-user learning result.

No final PNG/MP4 media was produced. Earlier screenshots remain historical evidence; even newly inspected screenshots are not admitted as release media. The release executor must wait for independent product/release review, capture that reviewed commit, re-read the current Studio contracts, and generate and visually inspect final media from that version.

## Residual limits and review handoff

R1-01 through R1-04 and the newly reproduced R3-01 have passing regressions in this scope. No known material gap from these exercised paths remains unresolved. This is not a bug-free, security, accessibility, or educational-efficacy certification. Independent final product and release review remain pending; none of this document grants approval to publish.

Unstarted question-set editors remain explicitly tab-only, so copying them is still necessary before leaving. Leave prompts are not a backup and can be unreliable, particularly on mobile, as described by the browser documentation [1]. The current scope does not claim Node 22-specific execution, Firefox/Safari certification, screen-reader testing, physical-device testing, encryption, secure erasure, multi-tab conflict resolution, export re-import, question generation, or automatic semantic grading. The data remains locally editable and supplied references can be wrong.

Repository-local commit identities use the authenticated account's noreply address. Whole-tree and history scans run before push; operational receipts remain outside the repository. Pattern scanning is not a guarantee against every secret format. The final exact repository SHA and remote reconciliation are recorded in the private continuation checkpoint after commit, avoiding a self-referential commit hash in this document.

[1] MDN, Window: beforeunload event, usage notes; rechecked 2026-09-27: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
