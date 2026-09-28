# Release validation

The application code reviewed for this release is commit `d2ed0f45b505a7ad08ba9bf4b5798318f5c76bf7`. The release adds documentation, security/deployment workflows, and the demonstration video; the five application files are unchanged.

## Reproduce the checks

With Node 22 or later, run:

```sh
node tests/run.cjs
node demo/run.cjs
```

Independent validation on Node 22.22.2 passed all 56 assertions. The real browser review exercised empty and malformed imports, answer and confidence requirements, reference reveal, locked responses, self-check notes, another round, opt-in browser saving and reload, confirmed removal, corrupt saved data, and a downloaded JSON export. Responsive checks included widths 320, 390, 768, and 1360 pixels. Keyboard focus and native radio navigation were exercised.

These checks do not establish screen-reader compatibility, physical-device behavior, or improved learning outcomes. References and examples are user-supplied or synthetic; no automatic grading takes place.

## Demonstration

`media/recall-before-reveal.mp4` uses actual screens captured after the product review, with synthetic example text, English captions, and no audio. It was assembled with DoniStudio's native edit-graph operations. Four decoded frames and the complete video decode were checked independently.

- MP4 / H.264, 720 × 768, 24 fps, 180 frames, 7.5 seconds.
- SHA-256: `40d6858909e62849f18718948d1e36e266aa2208bd7f3c35cc5f191b11c3656f`.
- Product review completed: 2026-09-28T00:53:32.473Z.
- Video rendered: 2026-09-28T01:20:32.757Z.

The site publishes only the five application files, MIT license, this reviewed demonstration, and an empty `.nojekyll` marker. Test output, operational receipts, and local data are excluded. The security workflow scans complete Git history and current files; deployment also scans its exact static artifact.
