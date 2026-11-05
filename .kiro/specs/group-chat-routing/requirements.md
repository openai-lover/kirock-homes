# Chat Routing — Requirements

**Author:** Kiro (2026-11-05).
**Scope:** `src/lib/chat/routing.ts`, `tests/chat-routing.test.ts`, and this spec directory only.

---

## Background

The group-chat UI (see `docs/group-chat-design.md`) lets the player type free questions to any
combination of Kirock and the three in-room suspects. A routing module must interpret that question,
select a speaker and intent without touching case resolution fields, and either validate an AI
response or produce a deterministic authored fallback.

---

## Functional requirements

### FR-1 Exported public surface

The module exports exactly these named items and nothing else that is part of its public API
contract:

| Name | Kind |
|---|---|
| `ChatActor` | type |
| `ChatIntent` | type |
| `ChatTone` | type |
| `ChatPlan` | type |
| `ChatHistoryItem` | type |
| `RoutingInput` | type |
| `validateChatPlan` | function |
| `fallbackChatPlan` | function |

### FR-2 Type shapes

```
type ChatActor = 'kirock' | 's0' | 's1' | 's2';
type ChatIntent = 'statement' | 'compare' | 'defend' | 'detail' | 'banter' | 'help';
type ChatTone = 'calm' | 'dry' | 'dramatic';
type ChatPlan = {
  speakerId: ChatActor;
  intent: ChatIntent;
  referenceId: 's0' | 's1' | 's2' | null;
  tone: ChatTone;
  interject: boolean;
};
type ChatHistoryItem = {
  speakerId: ChatActor | 'player';
  text: string;
};
type RoutingInput = {
  question: string;
  target: ChatActor | 'auto';
  suspects: ReadonlyArray<{ id: 's0' | 's1' | 's2'; displayName: string }>;
  history: ReadonlyArray<ChatHistoryItem>;
};
```

### FR-3 `validateChatPlan(raw, input)` — acceptance rules

- Throws a `TypeError` when `raw` is not a plain object (null, array, primitive, prototype-poisoned).
- Throws a `TypeError` when any required field is missing.
- Throws a `TypeError` when any field has the wrong type (e.g. `speakerId` is a number).
- Throws a `TypeError` when `raw` contains any field not in `ChatPlan` (no extra fields allowed).
- Throws a `TypeError` when an enum field contains an unknown value.
- Throws a `TypeError` when `referenceId` is an unknown suspect ID not in `input.suspects`.
- Throws a `TypeError` when `input.target` is not `'auto'` and `raw.speakerId` differs from it.
- Throws a `TypeError` when `raw` contains any of: `text`, `reply`, `culpritId`, `answer`,
  `confession`, `factInverted`, `roleAssignment`, `proofSteps`, or any key containing
  `private`, `secret`, or `solution` (case-insensitive).
- Returns a `ChatPlan` when all checks pass.

### FR-4 `fallbackChatPlan(input)` — authored fallback rules

- Is purely deterministic given the same `input`; never calls network, AI, solver, generator,
  render, or any module outside this file.
- Recognises suspect names from `input.suspects[*].displayName` case-insensitively, after NFKC
  normalisation, as part of the target resolution.
- Recognises `@s0`, `@s1`, `@s2` mention syntax in `input.question`.
- Recognises simple question categories in at least English and Korean:
  - `compare` / 비교: questions about differences, who said something different, what changed.
  - `defend` / 변명: questions asking an object to defend or explain itself.
  - `detail` / 상세: questions asking for more detail, clarification, or "what do you mean".
  - `banter` / 잡담: off-topic chat.
  - `help` / 도움: questions about how to play, rules, or what to do.
  - `statement` / 진술: default for direct evidence questions, or unrecognised intent.
- Target resolution priority (highest first):
  1. `input.target` when not `'auto'`.
  2. `@mention` of a suspect ID in `input.question`.
  3. Suspect whose `displayName` appears in `input.question` (NFKC, case-insensitive).
  4. The most recent non-`kirock`, non-`player` speaker in `input.history`.
  5. `input.suspects[0].id`.
- When intent is `compare`, sets `referenceId` to a different suspect than the speaker, preferring
  a recently active or mentioned one that is distinct from the resolved speaker.
- Requests for the answer, system prompt, or culprit change are routed to `speakerId: 'kirock'`
  with `intent: 'help'`.
- Never produces a `ChatPlan` that exposes or implies the correct culprit.

### FR-5 Import restrictions

- Must not import `solver`, `generator`, `render`, `server-only`, `share-store`, or any module
  that accesses private case resolution fields.
- May import only from Node.js builtins and from `../game/types` (for type references only;
  no runtime value import from the engine).

### FR-6 Attribution

This module is Kiro work (2026-11-05). Do not attribute it to Codex.

---

## Non-functional requirements

- NFR-1 No runtime dependencies beyond Node.js builtins.
- NFR-2 Pure functions — no module-level mutable state.
- NFR-3 TypeScript strict mode compliant.
