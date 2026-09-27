# Implementation evidence

Observed on 2026-09-27. This is first-implementation validation by the implementation worker, **not** any of the three separately requested quality rounds, independent product review, release approval, or a learning-outcome study. All exercised content is synthetic.

## Safe executable gate

Run from the repository root. No package installation is required.

| Exact command | Observed result |
| --- | --- |
| `node --version` | `v24.16.0` |
| `node tests/run.cjs` | Exit 0; `RESULT 42/42 passed; 0 failed. Network and child processes disabled.` |
| `node --permission --allow-fs-read=. tests/run.cjs` | Exit 0; the same 42 tests passed under the additional Node permission guard. |
| `node --check app.js` | Exit 0. |
| `node --check core.js` | Exit 0. |
| `node --check storage.js` | Exit 0. |
| `git diff --check` | Exit 0; no reported whitespace errors. |

The single-process harness blocks network, child-process, and worker APIs before loading the suites. Tests cover malformed Q/A blocks and line errors, CRLF/BOM/multiline text, all input limits, literal hostile markup, explicit confidence, reveal/advance ordering, original-state preservation, locked attempt snapshots, reflection, repeated rounds, deterministic exports, corrupt saved states, drafts, storage quota failures, deletion isolation, and the 500-attempt boundary. Contract assertions also check local assets, unique IDs, label/ARIA targets, wired buttons, no dependencies/install hooks, pending release gates, and GUI/demo fixture parity.

An earlier invocation used `node --experimental-permission --allow-fs-read=. tests/run.cjs`. It exited 9 with `bad option: --experimental-permission`; it did **not** run tests. The corrected guard command above passed. Node 22 is the declared minimum, but this execution used Node 24; Node 22 itself was not separately exercised.

## Deterministic practical outcome

The following commands were executed twice-run style, with `EVIDENCE_DIR` resolving to an isolated directory outside this repository:

```sh
node demo/run.cjs > "$EVIDENCE_DIR/demo-final-a.json"
node demo/run.cjs > "$EVIDENCE_DIR/demo-final-b.json"
cmp "$EVIDENCE_DIR/demo-final-a.json" "$EVIDENCE_DIR/demo-final-b.json"
sha256sum "$EVIDENCE_DIR/demo-final-a.json"
```

Both runs exited 0, and `cmp` found identical bytes. SHA-256:

```text
ddc8516967fb6315269ec3693731ba48547d5b6802280f08c6fe97acd3f1ab9e
```

The result contains two actual core-generated attempt records with fixed synthetic timestamps. The first preserves a high-confidence response, a later user-supplied “Missed something” judgment, and a note naming the missing context. The second preserves a medium-confidence response and a user-supplied “Got the main idea” judgment. There is no generated correctness score or inferred semantic judgment.

## Actual browser execution

Google Chrome `151.0.7922.137`, driven by an already installed Playwright environment, loaded the real local `index.html` with the browser context offline. The final run returned:

```json
{"passed":39,"page_errors":0,"remote_requests":0,"screenshots":5,"browser_engine":"chromium","chromium_sandbox":true}
```

Desktop viewport: 1360 × 980. Mobile viewport: 390 × 844. Additional layout assertions covered widths 320, 360, 640, 768, and 1024. All tested widths had document width no greater than viewport width.

The 39 browser assertions exercise empty state and disabled export; skip-link access; blank and malformed import; hidden reference and cleared import text; blank-answer refusal; explicit confidence; Space/Enter reveal; read-only answer and disabled confidence controls; reference-heading focus; one attempt per reveal; a real browser JSON download and parsed fields; saved revealed-state restoration; saved draft/confidence restoration; next-question reset; round completion and self-reported gap note; log expansion; another round; cancelled replacement; returning from the editor; removal of only the app's storage key; forgetting; narrow layouts; unavailable storage; failed saving; corrupt storage; and literal hostile question/reference text. The final checks assert no page errors or HTTP(S) page requests. They do not measure unrelated browser background processes or constitute a network-security certification.

The successful browser command used a separate, automatically collected test process with a 256-task maximum, 1 GiB memory maximum, two-CPU quota, and a 180-second runtime ceiling. Existing services and production policies were not modified. Chrome retained its sandbox; the test limited renderer/raster counts and its own CPU affinity. The application was opened from local files; no preview server was required.

For privacy, absolute paths and the temporary unit name are represented here by aliases. The resolved invocation, browser harness, stdout, source hashes, and screenshots remain in private operational evidence outside this repository:

```sh
systemd-run --user --quiet --pipe --wait --collect \
  --unit="$TEST_UNIT" \
  --property=TasksMax=256 --property=MemoryMax=1G \
  --property=CPUQuota=200% --property=RuntimeMaxSec=180 \
  --working-directory="$JOB_DIR" \
  /usr/bin/env PYTHONDONTWRITEBYTECODE=1 \
  "$BROWSER_PYTHON" "$EVIDENCE_DIR/check-ui.py"
```

This optional browser harness is **not** part of `test_files` or the safe dependency-free test command: a real browser necessarily launches processes. It is separate implementation evidence, not a hidden runtime dependency.

## Visual inspection and corrections

Desktop empty, revealed, and completed states and mobile empty/revealed states were opened as actual images and visually inspected. The form, locked answer, confidence selection, reference, reflection controls, and export log were readable without clipping in these captures. The mobile inspection found a spatially incorrect “on the left” instruction; it was changed to “Add a question set, or try the example.” The full 39-check journey was rerun after that change and new captures replaced the current evidence set. The corrected mobile capture was inspected again.

The five current test PNGs contain only IHDR, IDAT, and IEND chunks: no text or EXIF metadata chunks. They contain only the synthetic application page, not browser chrome, user profiles, session exports, or private user data. Their manifest binds them to these current application sources:

| Source | SHA-256 |
| --- | --- |
| `index.html` | `1d9cc75af16d2c5cef0893c71f4119f338e9a34568553136668b7e00e0ea830d` |
| `styles.css` | `2957d3ecc9a0bc6415a32fbcf87ba2d6413fc109cb64a5c99bb99231ffdd4b13` |
| `app.js` | `3699574db284d0af2b0b6e2c597c0bfcc354caa9b646bd5b9028f2b35e48dc6a` |
| `core.js` | `8daf09f0e02a09bf2949e2d324476147b39352ba9a419ca874b1516efc70ffcd` |
| `storage.js` | `7f897b4075138cc341f68877d9281a9fd25d73568bfd88e54333c567b22c4339` |

These are preliminary test screenshots, **not final media**. Older captures are retained only as historical test evidence outside the repository and must not be admitted to release media.

## Failures preserved and resolved

Initial browser launches hit a Unix socket path-length limit and then thread ceilings in shared or 128-task test processes. Firefox also encountered a sandbox-broker thread-creation failure; no Firefox browser-matrix PASS is claimed. A screenshot file-writing helper needed an extra thread and was replaced by a direct byte write. An initial lock assertion inspected a fieldset rather than the disabled radio controls; the corrected assertion verifies the actual controls and the textarea's read-only property. Successful complete Chrome runs followed in the isolated bounded test process. None of these failures was converted into a fabricated PASS, and no browser sandbox was disabled.

An optional preview-server file write was blocked before reaching the host. The file was confirmed absent. The implementation and successful browser proof instead use the simpler local-file path; no preview server was started.

## Privacy, limits, and pending gates

The selected repository's owner, private visibility, and empty state were verified before the first write. Repository-local author and committer identity were set to the authenticated account's noreply address before the first commit. Whole-tree scanning includes untracked/ignored files; history scanning includes reachable blobs, commit identities/messages, and tags before every push. Pattern scanning and authored-file inspection are useful checks, not a guarantee against every possible secret format. Raw operational receipts and resolved host details stay outside this repository.

No model was selected, downloaded, called, or changed. No paid service, social publication, public visibility change, or final media generation is part of this implementation.

Limitations remain explicit: no semantic grading or question generation; no learning-efficacy evidence; no physical mobile device, screen-reader, or cross-browser certification; no Node 22-specific execution; no multi-tab conflict resolution, export re-import, encryption, or cross-device sync. Browser storage and local-file handling vary. The page is not a secure exam environment, and a supplied reference can be wrong.

The three additional rounds—critique, improvements, and final re-review—remain pending separate requests, followed by independent product/release review. See `demo-plan.md` for concrete acceptance criteria. The release executor must freeze the independently reviewed commit, re-read the current Studio contracts, and generate/inspect final media from that exact version. The media list remains empty.
