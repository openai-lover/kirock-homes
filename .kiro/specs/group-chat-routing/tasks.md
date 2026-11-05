# Chat Routing — Tasks

**Author:** Kiro (2026-11-05).

---

## Task list

- [x] T1 Write `src/lib/chat/routing.ts` with all exported types and both functions.
- [x] T2 Write `tests/chat-routing.test.ts` with meaningful test cases as specified.
- [x] T3 Run `node --import tsx --test tests/chat-routing.test.ts` and capture result here.

---

## Execution record

**Date:** 2026-11-05T14:18 +09:00
**Runtime:** Node 25.9.0 (tsx 4.23.15)
**Command:** `node --import tsx --test tests/chat-routing.test.ts`
**Working directory:** `/Users/kyumin/Documents/ChatGPT/kiro`
**Exit status:** 0

**Result summary:**
```
ℹ tests 84
ℹ suites 0
ℹ pass 84
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 172.619375
```

All 84 tests passed. Covered:
- validateChatPlan structural rejections (null, array, class instance, Object.create(null))
- Forbidden-field rejection (reply, text, culpritId, answer, confession, factInverted,
  roleAssignment, proofSteps, fields containing "private"/"secret"/"solution")
- Missing required field rejection for each of the five fields
- Enum and type errors (bad speakerId, intent, tone, non-boolean interject, bad referenceId)
- referenceId must be in current suspects list
- Explicit target enforcement: mismatch throws, match accepts, auto allows any
- Valid round-trips for all ChatActor, ChatIntent, ChatTone values
- fallbackChatPlan sensitive-request routing to kirock/help (English and Korean)
- Explicit target priority over name/mention/history
- @mention resolution (@s1, @s2)
- Display-name resolution (English, Korean, case-insensitive)
- Arbitrary unknown names treated as data (no error, valid plan)
- History-based fallback (skips kirock and player)
- Empty history falls to first suspect
- Intent classification for compare, defend, detail, banter, help, statement (EN + KO)
- compare referenceId: different from speaker, prefers mentioned/recent/first
- Tone selection: kirock→calm, banter→dry, defend→dramatic, default→calm
- interject flag: true for compare/defend with referenceId and suspect speaker; false otherwise
- Determinism: identical input produces identical output
- Import isolation: no solver/generator/render/server-only/share-store imports
- No property access to private case-resolution fields

**Not claimed:** browser validation, full-game integration, Playwright run.

