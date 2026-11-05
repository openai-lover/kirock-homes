# Actual Kiro refinement output

Returned by the actual CLI session. The exact successful TypeScript tool output is preserved separately in kirock-typecheck.log. Browser/build integration is performed by Codex and is not claimed by this report.

Let me re-read the current state of my files before making changes.Good. Now apply all changes at once — voice module first, then component, then the three spec files.Now update `DetectiveAside.tsx` — swap `h3` for `strong`, set image size to 72:Also update the file-header doc comment that still mentions h3:Also update the component JSDoc to drop the h3 mention:Now run the TypeScript check with the exact permitted command:Exit status 0, no output. Now update the three spec files to reflect final state.Final verification read of the two implementation files:Both files are correct. Here is the complete final summary.

---

## Final component API and markup classes

**`src/lib/ui/detective-voice.ts`**
```ts
export type DetectiveStage = 'casting' | 'awakening' | 'listening' | 'confronting' | 'deducing' | 'reveal';
export type StageCopy = Readonly<{ line: string }>;
export function getDetectiveVoice(stage: DetectiveStage, locale: Locale): StageCopy
```

**`src/components/DetectiveAside.tsx`**
```ts
export type { DetectiveStage };
export type DetectiveAsideProps = { stage: DetectiveStage; locale: Locale };
export default function DetectiveAside({ stage, locale }: DetectiveAsideProps): JSX.Element
```

Rendered markup structure:
```html
<aside class="detective-aside"
       data-testid="detective-aside"
       data-stage="{stage}"
       aria-label="{localized title}">
  <img class="detective-aside-mascot"
       src="/art/kirolock-homes.png"
       alt="" aria-hidden="true"
       width="72" height="72" decoding="async" />
  <div class="detective-aside-copy">
    <strong class="detective-aside-title">{title}</strong>
    <p class="detective-aside-line">{copy.line}</p>
  </div>
</aside>
```

---

## Final twelve localized stage lines

| Stage | EN | KO |
|---|---|---|
| casting | Pick three objects and place their faces. Every good case starts with a proper suspect list. | 사진 속 물건 셋을 골라 눈을 붙여 주세요. 탐정의 첫 번째 임무는 용의자 확보입니다. |
| awakening | Give them a moment. Waking up is hard enough without being immediately questioned. | 방이 깨어나는 중입니다. 아직 아무것도 할 필요 없어요 — 지켜만 보세요. |
| listening | Hear all three official statements. Those three statements are the only evidence in this case. | 세 물건의 공식 증언을 모두 들어 주세요. 이 세 마디가 이번 사건의 증거 전부입니다. |
| confronting | Question each object — another will object. Compare the two quoted statements side by side and note what you find. | 각 물건을 추궁하면 다른 물건이 반론합니다. 두 인용문을 나란히 놓고 직접 메모해 두세요. |
| deducing | Cross out hypotheses that don't fit — tap again to restore any. Your accusation is one-time only, so take your time. | 맞지 않는 가설을 눌러 지우고, 다시 누르면 되살릴 수 있어요. 지목은 딱 한 번이니 신중하게. |
| reveal | Case closed. Read the explanation to see how the three statements fit together. | 사건이 마무리됐습니다. 해설을 읽으면 세 증언이 어떻게 이어지는지 확인할 수 있어요. |

---

## TypeScript check result

Command: `node node_modules/typescript/bin/tsc --noEmit`
Working directory: `<project>`
stdout: (empty) — stderr: (empty) — **exit status: 0**

No diagnostics from any file. Recorded in `tasks.md` T4 as actually observed.

---

## Source authorship

- **Codex**: inherited engine, `Game.tsx`, CSS, server routes, `CrossExamination.tsx`, sample content, images, build/browser/e2e integration
- **Prior Kiro CLI**: `hypothesis.ts`, `HypothesisBoard.tsx`, `.kiro/specs/detective-hypotheses/`
- **This Kiro session**: `src/lib/ui/detective-voice.ts`, `src/components/DetectiveAside.tsx`, `.kiro/specs/kirock-voice/requirements.md`, `design.md`, `tasks.md`
