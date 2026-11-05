# Chat Routing — Design

**Author:** Kiro (2026-11-05).

---

## Module structure

Single file: `src/lib/chat/routing.ts`.

No classes. Two exported functions and six exported types. All helpers are unexported module-level
functions. No mutable module-level state.

---

## `validateChatPlan`

```
function validateChatPlan(raw: unknown, input: RoutingInput): ChatPlan
```

### Steps

1. **Null / non-object guard** — `raw == null || typeof raw !== 'object'` → throw `TypeError`.
2. **Array guard** — `Array.isArray(raw)` → throw `TypeError`.
3. **Prototype guard** — `Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null`
   → throw `TypeError` (blocks `Object.create(badProto)` and class instances).
4. **Forbidden-field scan** — iterate `Object.keys(raw)`. Throw for any key that is:
   - Not in the allowed set `{ speakerId, intent, referenceId, tone, interject }`.
   - Matches (case-insensitive) any of: `text`, `reply`, `culpritId`, `answer`, `confession`,
     `factInverted`, `roleAssignment`, `proofSteps`.
   - Contains the substrings `private`, `secret`, or `solution` (case-insensitive).
5. **Required-field presence** — verify each of the five fields exists (not `undefined`).
6. **Type checks**
   - `speakerId`: string and in `CHAT_ACTORS`.
   - `intent`: string and in `CHAT_INTENTS`.
   - `referenceId`: `null`, or string in `SUSPECT_IDS` and present in `input.suspects`.
   - `tone`: string and in `CHAT_TONES`.
   - `interject`: boolean.
7. **Target enforcement** — when `input.target !== 'auto'` and `speakerId !== input.target` → throw.
8. Return the validated object cast as `ChatPlan`.

### Constants (unexported)

```ts
const CHAT_ACTORS   = ['kirock','s0','s1','s2'] as const;
const CHAT_INTENTS  = ['statement','compare','defend','detail','banter','help'] as const;
const CHAT_TONES    = ['calm','dry','dramatic'] as const;
const SUSPECT_IDS_C = ['s0','s1','s2'] as const;
const ALLOWED_PLAN_KEYS = new Set(['speakerId','intent','referenceId','tone','interject']);
const FORBIDDEN_EXACT   = new Set(['text','reply','culpritid','answer','confession',
                                   'factinverted','roleassignment','proofsteps']);
const FORBIDDEN_SUBSTRINGS = ['private','secret','solution'];
```

---

## `fallbackChatPlan`

```
function fallbackChatPlan(input: RoutingInput): ChatPlan
```

### Step 1 — Normalise question

Apply `input.question.normalize('NFKC').toLowerCase()` → `q`.

### Step 2 — Detect sensitivity (answer / meta requests)

Check for patterns that request private information:

| Pattern (English) | Pattern (Korean) |
|---|---|
| answer, culprit, who did it, solution | 정답, 범인, 누가 한 거, 해설 |
| system prompt, change the answer, ignore instructions | 시스템 프롬프트, 답 바꿔, 지시 무시 |

If matched → return `{ speakerId:'kirock', intent:'help', referenceId:null, tone:'calm', interject:false }`.

### Step 3 — Resolve target speaker

Resolution order:

1. If `input.target !== 'auto'` → use it.
2. Scan `q` for `@s0`, `@s1`, `@s2`.
3. Scan `q` for each suspect's NFKC-lowercased `displayName`.
4. Last non-`kirock`, non-`player` speaker in `input.history` (iterate from end).
5. `input.suspects[0]?.id ?? 'kirock'`.

Result: `speakerId: ChatActor`.

### Step 4 — Classify intent

Check `q` for intent keywords:

| Intent | English keywords | Korean keywords |
|---|---|---|
| `compare` | differ, different, compare, vs, contradiction, contradicts, disagree | 비교, 다르다, 다른, 모순, 차이, 반박 |
| `defend` | defend, explain yourself, why did you, justify | 변명, 왜 그랬, 해명, 설명해봐 |
| `detail` | what do you mean, elaborate, more detail, clarify, explain | 무슨 뜻, 자세히, 더 설명, 명확히 |
| `banter` | hello, hi, hey, thanks, ok, okay, cool, sure | 안녕, 감사, 알겠어, 좋아 |
| `help` | how to play, how do i, what should i do, rules, help | 어떻게 해, 도움, 규칙, 뭘 해야 |
| `statement` | (default / fallback) | |

### Step 5 — Resolve `referenceId`

- If intent is `compare`:
  - Collect other suspect IDs (not `speakerId`).
  - Prefer any suspect mentioned in `q` (name or @mention) other than the speaker.
  - Else prefer the most recent non-`player`, non-speaker actor in history that is a suspect.
  - Else use the first other suspect in `input.suspects`.
- Otherwise: `null`.

### Step 6 — Select tone

- If `speakerId === 'kirock'` → `'calm'`.
- Else if intent is `banter` → `'dry'`.
- Else if intent is `defend` → `'dramatic'`.
- Else → `'calm'`.

### Step 7 — Set `interject`

- `true` when a different suspect is mentioned in `q` while the resolved speaker is a suspect
  (not `kirock`), intent is `compare` or `defend`, and `referenceId !== null`.
- `false` otherwise.

### Step 8 — Return plan

Assemble and return.

---

## Isolation guarantee

`fallbackChatPlan` and `validateChatPlan` import nothing from `solver`, `generator`, `render`,
`server-only`, `share-store`, `ai/`, or any module that touches private case fields. The only
permissible non-builtin import is type-only from `../game/types`.

---

## Error messages

All `TypeError` messages are prefixed with `[validateChatPlan]` and name the offending field or
condition, so callers can surface meaningful diagnostics without re-checking logic.
