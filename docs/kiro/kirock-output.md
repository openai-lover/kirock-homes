# Actual Kiro first-pass output

This is Kiro's returned text, not an independent validation report. Its own TypeScript command was denied in this pass; the follow-up records the corrected execution.

Let me read the relevant files before writing anything.Good. I have all the context I need. The branding doc notes the English name was "Kirolock Homes" — the prompt supersedes that with "Kirock Homes". The image file `/art/kirolock-homes.png` stays unchanged. Now I'll write the five files.Now the three spec files:Now run the TypeScript check and record the exact result:The shell command is blocked by the scoped agent config. I'll record that honestly in tasks.md.Let me do a final read of both implementation files to confirm they are complete and correct before summarising.Both files look correct. Here is the complete summary.

---

## What was built

### Module and component API

**`src/lib/ui/detective-voice.ts`** (Kiro)

```ts
export type DetectiveStage =
  | 'casting' | 'awakening' | 'listening'
  | 'confronting' | 'deducing' | 'reveal';

export type StageCopy = { line: string };

export function getDetectiveVoice(stage: DetectiveStage, locale: Locale): StageCopy
```

Pure TypeScript — no React, DOM, randomness, solver, case, answer, server, or AI dependency. One type-only import of `Locale` from `@/lib/game/types`.

**`src/components/DetectiveAside.tsx`** (Kiro)

```ts
// named exports
export type { DetectiveStage };
export type DetectiveAsideProps = { stage: DetectiveStage; locale: Locale };

// default export
export default function DetectiveAside({ stage, locale }: DetectiveAsideProps): JSX.Element
```

Marked `'use client'` to sit cleanly inside Game.tsx's client tree. No state, no network, no answer/solver dependency.

---

### The twelve localized stage lines

| Stage | English | Korean |
|---|---|---|
| casting | Pick three objects and place their faces. Every good case starts with a proper suspect list. | 사진 속 물건 셋을 골라 눈을 붙여 주세요. 탐정의 첫 번째 임무는 용의자 확보입니다. |
| awakening | Give them a moment. Waking up is hard enough without being immediately questioned. | 방이 깨어나는 중입니다. 아직 아무것도 할 필요 없어요 — 지켜만 보세요. |
| listening | Hear all three official statements. These are the only evidence — take notes if you like. | 세 물건의 공식 증언을 모두 들어 주세요. 증거는 이 세 마디뿐입니다. |
| confronting | Question each object and compare their objection to the official statement. Pin the gap. | 각 물건을 추궁해 반론을 들으세요. 공식 증언과 나란히 놓고 비교해 보세요. |
| deducing | Cross out worlds that don't fit. The notebook has no idea who did it — that part's on you. | 맞지 않는 가설을 직접 지워 가며 좁혀 보세요. 수첩은 정답을 모릅니다 — 당신만 알죠. |
| reveal | Case closed. Read the explanation to see how the three statements fit together. | 사건이 마무리됐습니다. 해설을 읽으면 세 증언이 어떻게 이어지는지 확인할 수 있어요. |

All six reveal lines are phrased identically whether the accusation was right or wrong. None reference guilt, motive, facial tells, or specific outcomes. The three official statements remain the only logical evidence.

---

### TypeScript check (T4)

The CLI agent configuration blocked shell execution in this session. The command to run is:

```bash
node node_modules/typescript/bin/tsc --noEmit
```

Run it from the project root. If any diagnostic points to the two owned files, fix them. Diagnostics from files outside the five owned files are reported unchanged and not modified by this feature. The result goes into tasks.md's verification record.

---

### Integration notes for Codex

- Wire `<DetectiveAside stage={…} locale={locale} />` inside `Game.tsx`. The recommended phase → stage mapping is in `design.md`.
- Add CSS for the six class names: `detective-aside`, `detective-aside-mascot`, `detective-aside-copy`, `detective-aside-title`, `detective-aside-line`.
- `data-testid="detective-aside"` and `data-stage="{stage}"` are already on the `<aside>` for Playwright verification.
- Heading level is `h3` by default; adjust if the document outline requires it.
- The `/art/kirolock-homes.png` filename is intentionally historical — no rename needed.
