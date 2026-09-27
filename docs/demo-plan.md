# Demonstration and review handoff

## Current boundary

This is the first implementation, not the additional quality rounds or an independent product/release approval. Keep the repository private. Final media is intentionally empty. Preliminary screenshots belong to test evidence outside the repository and are not approved promotional assets.

No model was selected, changed, downloaded, or called for this product. There is no runtime model selection.

## Useful demonstration

The outcome is a real, readable attempt record that preserves what someone said and how confident they felt **before** seeing the reference. Use only the synthetic two-question example shared by the page and `demo/run.cjs`.

| Step | Action in the real UI | Observable evidence |
| --- | --- | --- |
| Set | Load the two-question example, then start. | First question visible; reference absent; no confidence preselected. |
| Commit | Type “Tell it to make the message sound better.” Select High. | Answer and confidence are present before reveal. |
| Reveal | Select Record & reveal. | Typed answer remains locked above the supplied reference. |
| Reflect | Select Missed something. Add “Add the audience, purpose, tone, and what must stay unchanged.” | It is explicitly the user's self-check, not automatic grading. |
| Continue | On question two type “Check important facts with a reliable source, not the confident tone.” Select Medium, reveal, and select Got the main idea. Add “Confidence is not evidence.” | A second distinct attempt is recorded. |
| Export | Finish the round and export JSON. | Download contains both original attempts, confidence, reference snapshots, notes, and self-checks. |

The CLI demo uses fixed synthetic reveal times for repeatability. The browser uses the actual local clock. Do not present the scripted self-checks as user-study evidence or call the output a correctness score.

## Separately requested quality rounds

**Critique.** A separately requested pass should inspect the actual implementation commit and execute the app. Identify material findings with reproducible steps and severity, especially accidental reference exposure, saving/forgetting failures, keyboard focus, narrow-screen usability, and export interpretation. Acceptance: evidence-backed findings and explicit criteria for resolving each material gap. No implementation approval should be inferred merely from the first test run.

**Improvements.** A separate request should address the accepted findings in this same repository and isolated workspace, preserving the original privacy/release restrictions. Acceptance: each resolved finding has a concrete change and regression evidence; unresolved material gaps remain open. Re-run the safe gate and browser journeys. Bind fresh preliminary evidence to the changed source hashes.

**Final re-review.** A separate request should examine the improvements against the critique, rerun affected journeys, and check documentation, privacy, export fidelity, and commit identity. Acceptance: no unresolved material issue is silently promoted to PASS; further continuation is required for such gaps. This pass is not a substitute for an independent final product review or release approval.

## Release executor, only after review

Freeze the independently reviewed commit. Read the **current** DoniStudio agent contracts again at execution time; a historical contract hash is not permission to render with changed code. Capture the real application at desktop/mobile sizes from that exact commit with synthetic data. Use the native Studio workflow required by those contracts for any final media, inspect the actual output, and keep source commit, capture, and media lineage together in private operational receipts.

Do not admit a screenshot or video from a superseded product version, a mock interface, or a preliminary browser-test frame as final media. Recheck both the UI and the exported data before media approval. Preserve the distinction between “prepared,” “executed,” “review required,” and “approved.” No repository visibility change, publication, paid service, social post, or message is authorized by this document.
