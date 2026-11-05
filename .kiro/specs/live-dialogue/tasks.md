# Live Dialogue — Tasks

**Author:** Kiro (2026-11-05).

---

## Task list

- [x] T1 Write `.kiro/specs/live-dialogue/requirements.md`.
- [x] T2 Write `.kiro/specs/live-dialogue/design.md`.
- [x] T3 Write `src/lib/chat/performance.ts` with all exported types and both functions.
- [x] T4 Write `tests/performance.test.ts` with meaningful test cases as specified.
- [x] T5 Run the test command and capture the result below.

---

## Execution record

**Date:** 2026-11-05T18:20 +09:00
**Runtime:** Node 25.9.0 (tsx 4.23.15)
**Command:**
```
/Users/kyumin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  --import tsx --test tests/performance.test.ts
```
**Working directory:** `/Users/kyumin/Documents/ChatGPT/kiro`
**Exit status:** 0

**Result summary:**
```
ℹ tests 107
ℹ suites 14
ℹ pass 107
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 97.997583
```

All 107 tests passed across 14 describe suites. Covered:

- `validatePerformance` top-level shape: null/string/array/class-instance rejection, missing
  `lines`, non-array `lines`, 0 lines, 3 lines, unexpected top-level key.
- Forbidden top-level keys: `answer`, `culprit`, `culpritId`, `confession`, `proof`, `proofSteps`,
  `solution`, `verdict`, `privateData`, `secretKey`.
- Line shape: null line, array-as-line, missing `speakerId`/`text`/`quoteIds`, unexpected line key.
- `speakerId`: numeric, unknown string, `"player"`, suspect absent from `suspectIds`,
  valid s0/s1/s2 round-trips.
- Target enforcement: auto allows any, explicit match accepts, explicit mismatch throws;
  target only constrains first line.
- Repeated-speaker rejection across two lines.
- Text length: 1 char, 240 chars, 241 chars, empty string, whitespace-only, trim boundary cases.
- XSS / unsafe content: HTML open tag, img tag, closing tag, https URL, http URL, code fence,
  null byte, CR character; harmless apostrophe/dash accepted.
- Confession/verdict pattern guard (defense-in-depth): 9 English patterns, 7 Korean patterns,
  1 innocent text accepted.
- Forbidden fields inside lines: `answer`, `culprit`, `culpritId`, `confession`, `proof`,
  `verdict`, `privateNote`, `secretHint`.
- `quoteIds`: 0/1/2 valid entries, 3 entries rejected, unknown ID, duplicate ID, non-array,
  non-string entry.
- Unknown references: suspect not in `suspectIds`, quoteId not in `statementIds`.
- `performanceReviewPassed`: exact approval object → true; null, string, array, wrong boolean
  values, string `"true"` for `approved`, extra key, missing key, empty object → false.
- Round-trip: two-line performance with mixed quoteIds and explicit target.

**Not claimed:** browser validation, full-game integration, Playwright run, live AI call.
