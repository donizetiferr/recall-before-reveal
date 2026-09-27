# Round-two improvements and regression evidence

Historical round-two report. Current candidate status and fresh final checks are in [Round-three product re-review](review.md). Counts and pending-round statements below retain their original scope.

Observed 2026-09-27. This is the separately requested **quality round 2 of 3**, based on critique of commit `06532802c8d31407f963cf314a7937e0e0edfa49`. It is not round-three re-review, independent product review, release approval, or a learning-outcome study. The repository remains private. All fixtures are synthetic; final media is empty.

## Findings addressed

### R1-01 — confirm deletion rather than assuming it

The UI now always calls the fallible storage-removal operation, including when the storage accessor was unavailable. Removal is confirmed only after a readback finds this app's key absent. Access failure, removal failure, silent no-op removal, and failed readback produce an unconfirmed-removal warning. The current tab is retained on failure; no successful-deletion message is shown. Browser-settings guidance and the distinction from downloaded exports remain visible.

Acceptance exercised: the original accessor-failure reproduction now retains an unsaved editor and reports uncertainty while the old saved bytes remain restorable. A separate removal failure retains the active practice and refuses a misleading opt-out. Restoring storage access permits normal forgetting, deleting only the app key. Unit tests cover no-op removal and failed readback as well. This is not a secure-erasure guarantee.

### R1-02 — reliable safe-test output

The runner initializes Node's lazy standard streams before installing its network/process guards. It writes bounded result lines through existing file descriptors and separates test execution from output handling. The pure runner returns a failing exit status for output failures, including when both sinks fail, without relabeling passed assertions as failed tests. Network, worker, and child-process APIs remain denied by the test harness.

Acceptance exercised: terminal, regular-file, pipe, and combined output capture all return 52/52 passing tests and Node exit 0. Guarded runs also pass. Injected output failures return exit status 1 and are identified as harness errors; falsy thrown values and asynchronous test cases cannot become false passes. These guards are for the project's trusted tests, not a general sandbox for arbitrary hostile code.

### R1-03 — refuse oversized input without shortening references

The question-set textarea no longer has native `maxlength` truncation. A paste handler checks the resulting length, accounting for selected text and normalized line endings, before accepting native clipboard input. Refused pastes leave the previous editor text and active practice untouched. Starting from that old buffer is blocked until the user edits it or supplies a valid paste. Input and core validation also reject an oversized buffer when insertion bypasses the paste handler. Existing size limits are unchanged and the total limit is now visible.

Acceptance exercised with actual trusted native clipboard events: the original 100,514-character fixture is refused without losing its last 514 characters into an accepted, shortened reference. Exactly 100,000 characters are accepted intact and all 25 resulting references match the intended input. A 100,001-character paste is refused; insertion into existing text and selection replacement use the combined length correctly. Native non-paste insertion reaches validation as the full 100,001-character buffer and cannot start practice. A previously recorded answer, confidence, reference, and reflection remain unchanged during refusal.

### R1-04 — distinguish the editor draft from saved practice

The saved status now names the **active practice and answer draft**. Unstarted question-set text has a separate **not saved** message, including while hidden after Back to current practice. Returning to the editor preserves its exact title and text. The leave guard includes that editor even when active practice is saved; title-only drafts are also protected from example replacement. Starting a replacement still needs confirmation and never rewrites prior reference snapshots in place.

Acceptance exercised: native reload dialogs appear for visible and hidden dirty editors and for an initial title-only draft. Cancelling reload preserves the text. Explicitly confirming departure discards only tab-only work while the saved active practice, including a locked attempt and reflection, restores unchanged. Clearing both editor fields removes the stale warning; a saved practice with an empty editor reloads without a dialog. Active answer drafts and confidence still restore normally.

The chosen design is intentionally **not editor autosave**. Copy editor text before leaving. A browser/operating system can suppress a leave prompt, especially on mobile; it is a safety net, not a backup [1]. The page's persistent-copy wording and README now make this distinction explicit.

## Executed commands and results

Run CLI commands from the repository root; no installation is required. Output aliases below refer to private evidence outside this repository, not additional product dependencies.

| Command | Observed result |
| --- | --- |
| `node --version` | `v24.16.0` |
| `node tests/run.cjs` | 52/52 passed, zero failed; exit 0. |
| `node --permission --allow-fs-read=. tests/run.cjs` | Same 52 cases passed; exit 0. |
| `node tests/run.cjs > "$EVIDENCE_DIR/unit-file.log" 2>&1` | Complete results; exit 0. |
| `node tests/run.cjs \| cat > "$EVIDENCE_DIR/unit-pipe.log"` | Node and consumer exit statuses: 0, 0. |
| `node tests/run.cjs 2>&1 \| cat > "$EVIDENCE_DIR/unit-combined.log"` | Node and consumer exit statuses: 0, 0. |
| `node --permission --allow-fs-read=. tests/run.cjs 2>&1 \| cat > "$EVIDENCE_DIR/unit-guarded-combined.log"` | Node and consumer exit statuses: 0, 0. |
| `script -q -e -c 'node tests/run.cjs' /dev/null` | Real pseudo-terminal output: 52/52 passed; exit 0. |
| `script -q -e -c 'node --permission --allow-fs-read=. tests/run.cjs' /dev/null` | Guarded pseudo-terminal output: 52/52 passed; exit 0. |
| `node --check app.js` and `node --check storage.js` | Both exited 0. |

Pipeline statuses were read with `PIPESTATUS`, not inferred from the last consumer. File, pipe, and guarded combined outputs were byte-compared successfully. The terminal supplies its normal carriage returns. The test process itself never starts a child process, browser, worker, or network request; `script` and `cat` belong only to the external output-adapter checks.

Two executions of `node demo/run.cjs` were compared with `cmp`; their bytes match each other and the original demo. SHA-256: `ddc8516967fb6315269ec3693731ba48547d5b6802280f08c6fe97acd3f1ab9e`. The example, core domain logic, export format, and local-storage format are unchanged. No generated questions, automatic correctness judgments, or fabricated experiences were added.

## Real browser journeys

The actual local HTML was loaded in sandboxed Chrome with offline contexts. The baseline journey passed **39 assertions**; the targeted regression journey passed **42 assertions**. Both completed with Python exit 0 and their temporary launcher exit 0. Both observed zero page JavaScript errors and zero HTTP(S) page requests. These scoped counts overlap with unit coverage and must not be combined into an accuracy or learning metric.

The baseline includes keyboard/empty/error paths, literal hostile markup, reference hiding, locked attempts, real JSON download and parsed fields, saved draft/attempt restoration, repeated practice, and storage failure. The targeted journey additionally exercises the four acceptance sections above using native clipboard and reload actions, not just programmatic textarea values. Desktop size: 1360 by 980; mobile emulation: 390 by 844. Widths 320, 360, 390, 640, 641, 768, 1024, and 1360 had no horizontal document overflow in the targeted editor layout.

The operational harnesses and receipts stay outside the repository. Relative to the assigned workspace, they are `ops/check-ui-q2-93f8a867.py`, `ops/check-q2-93f8a867.py`, and `ops/q2-93f8a867/`. The final baseline and targeted logs are `baseline-run2.log` and `targeted-run3.log`; their `baseline/browser-report.json` and `targeted/browser-report.json` record source hashes and preliminary capture hashes. They are not entries in the dependency-free `test_files` gate.

Both harnesses used this bounded launch pattern, with the actual harness chosen explicitly. To reproduce the pattern, set and export the alias variables to the installed browser-test interpreter, the chosen operational harness, this job directory, and a new temporary-unit name:

```sh
systemd-run --user --quiet --pipe --wait --collect \
  --unit="$TEST_UNIT" \
  --property=TasksMax=256 --property=MemoryMax=1G \
  --property=CPUQuota=200% --property=RuntimeMaxSec=180 \
  --working-directory="$JOB_DIR" \
  /bin/bash -c 'PYTHONDONTWRITEBYTECODE=1 "$BROWSER_PYTHON" "$BROWSER_HARNESS"; rc=$?; printf "PYTHON_EXIT=%s\n" "$rc"; exit "$rc"'
```

Absolute paths and temporary-unit names are represented by aliases for privacy. Resolved invocations remain in private operational receipts. Existing services and production policies were not changed. The browser sandbox stayed enabled; no preview server was needed.

## Inspection, failures, and remaining boundaries

Fresh desktop/mobile revealed states, desktop paste refusal, desktop unconfirmed removal, and desktop/mobile unsaved-editor states were opened as images. Text and controls were readable without visible clipping. There are nine current preliminary captures across the two manifests, but **none is final media or a publication asset**. Source hashes must be rechecked after any further code change; old round-one images are historical only.

The first targeted harness stopped after four checks because its fault-installation expression returned a function that the browser driver invoked. The installer/restorer were wrapped explicitly; the application was not changed to mask that test error. The next run passed 40 checks. Two additional preconditions then verified preservation of nonempty locked attempt logs, and the final targeted run passed 42 checks. The earlier reports/logs remain preserved separately.

One early baseline wrapper returned a nonzero outer status despite a completed 39-check report. That ambiguous outer result was not promoted into a successful run. A subsequent bounded run explicitly reported Python exit 0 and launcher exit 0 with all 39 checks passing. Evidence never treats a printed PASS alone as a successful process receipt.

No Node 22-specific execution, other browser-engine certification, physical-phone test, screen-reader audit, encryption, multi-tab conflict handling, export re-import, or learning-efficacy study is claimed. Browser storage and leave prompts retain their documented limits. All four critique findings have scoped fixes and passing regressions; **round three must re-review them**, followed by independent product/release review. Final media must be generated and visually inspected only afterward from that reviewed commit. This round grants no release or publication approval.

[1] MDN, Window: beforeunload event, usage notes; opened 2026-09-27: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
