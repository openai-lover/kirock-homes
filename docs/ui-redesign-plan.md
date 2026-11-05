# UI redesign plan — a handmade detective caseboard

Prepared by Codex on 2026-10-31. This is a design/review plan, not evidence of Kiro execution or completed browser validation. The implementation and generated-asset record should identify their actual tools and results.

## Direction

Make the game feel like a tiny detective's desk: tangible paper, soft clay characters, worn ink, and a decisive stamped button. The memorable moment remains the user's own object opening its eyes. Generated artwork belongs around the photograph and controls; it must never repaint or replace the user's belongings.

Keep the existing sample → casting → awakening → investigation → one accusation → reveal → optional sharing flow. Do not add a new story, scoring system, account, puzzle rule, or additional step. Supported manual photos remain JPG/PNG/WebP within the implemented file/pixel limits; “any photo” means manually choosing three visible objects, not guaranteed automatic recognition or support for every file format.

## Tokens

| Token | Value | Role |
| --- | --- | --- |
| Ink midnight | `#182631` | Outer desk, body text on light material, strongest outlines |
| Case paper | `#f2dfb8` | Evidence sheet, photo mount, light text on the desk |
| Ghost mint | `#9bcbbd` | Heard/selected state, quiet secondary control, focus against dark surfaces |
| Pumpkin orange | `#ef8248` | Primary action with ink text |
| Dusty plum | `#70627a` | Decorative clay/shadow details, large secondary accents |
| Red seal | `#b9423f` | Verdict stamp and small decorative ink marks |

Calculated flat-color contrast is approximately ink/paper **11.78:1**, ink/mint **8.58:1**, and ink/orange **5.85:1**. Paper/plum (**4.31:1**) and paper/seal (**4.09:1**) are unsuitable for ordinary small text at a 4.5:1 target; reserve those combinations for sufficiently large type or decoration. Orange/paper and mint/paper should not carry essential text or the only visible control boundary. These calculations do not validate a generated image's variable texture; inspect text at the actual rendered positions.

The implemented type direction uses locally bundled Jua for rounded Korean/English display text and Gaegu for handwritten banter/notes, with system sans-serif for official testimony and small controls. Both font licenses are bundled. Keep all copy as HTML text, including Korean/English button labels. Official testimony is 14–15 px with generous line height; handwritten captions are 22–24 px. Compact helper labels are 10–12 px. This is the implemented sizing, not an assertion that every compact label reaches the original 12–13 px target.

## Generated asset roles

| Asset | Intended use | Guardrail |
| --- | --- | --- |
| Blank button skins | Tactile primary/secondary action material | No baked-in text; HTML label, real button semantics, clear focus, CSS fallback |
| Clay trio mascot | A small welcome illustration at the desk edge | Decorative; keep the real photo and awakening actors visually dominant |
| Detective desk backdrop | Quiet outer page texture | Low detail behind text; never stretch/crop the actual photo to fit it |
| Detective props | Paperclip, magnifier, tape, stamp at layout margins | `aria-hidden`, no pointer interception, no apparent evidence pointing to a culprit |

Artwork should share lighting, soft material texture, and restrained imperfect outlines. Avoid independent decorative motion on every prop. A desktop should read as one arranged desk, not many identical rounded boxes. Keep bitmap decoration useful at mobile sizes and provide simple color fills if an asset has not loaded. Record generated files and tool provenance in the asset documentation after generation actually completes.

## Layout

Desktop welcome: title and immediate actions on the left, actual photograph mounted on the right, a small trio at the desk edge. During play: photo mount on the left, one evidence sheet on the right, and limited props near the outer corners. The three witnesses retain matching identity numbers/colors on the photo and testimony list. The user rejected the initial eyeball magnifier; the implemented prop is an ordinary eye-free magnifier, and photo faces use small flat bean eyes.

```text
brand + small utility controls
┌──────────────────────┬────────────────────────┐
│ real photo mount     │ title / two entry      │  start
│ one blinking object  │ actions / small mascot │
└──────────────────────┴────────────────────────┘

┌──────────────────────┬────────────────────────┐
│ real photo + SVG     │ rule / official        │  play
│ current speaker     │ statements / accusation│
│ full caption below  │ or result + short proof│
└──────────────────────┴────────────────────────┘
```

Mobile: a compact title and reachable entry actions, then a proportionate photo preview. During play, keep the real photo and speaker caption together, followed by the evidence sheet. Do not let a tall portrait photo push both entry buttons below a long decorative introduction. Reduce props before shrinking testimony or touch targets. The photograph keeps its real aspect ratio in portrait, landscape, and rotated states.

Align sentences and forms to the left. Center only short button labels and an intentional welcome illustration. Use paper edges and a verdict stamp to distinguish evidence from action, while letting the photo stay the brightest and most personal object.

## Interaction refinements within the existing flow

1. **The first line needs room to land.** Open the first eyes immediately, then a short bubble and full caption with the speaker's name. Keep enough reading time when reduced motion is enabled; reduce animation, not subtitle duration. Keep the existing skip/continue path.
2. **Make listening visibly useful.** Clicking a face or its testimony should focus the matching witness, clearly mark the statement heard, and reveal the exact code-rendered sentence. Banter remains explicitly separate. No ornamental clue, face expression, or prop may depend on the answer before the reveal.
3. **Keep casting direct.** One selected object, one name/kind editor, and the existing face controls. Make the next placement apparent. Validate distinct names using the engine's normalization so an apparently enabled “Wake” button does not fail later.
4. **Make the one decision feel deliberate.** Selection and final accusation stay separate. The selected object name must be visible in the final control. Verdict styling changes after the server/local engine resolves the case, followed by the existing three proof steps.
5. **Preserve confident navigation.** Buttons remain native, focus is visible above textured skins, dialogs trap focus and return it to the opener, and loading/errors retain a clear recovery action.

## Current code review findings to address

- Official testimony buttons have an explicit accessible label containing only the object name and “statement”; this can hide their visible official text from the accessible name. Connect the revealed sentence with `aria-describedby` or a dedicated announcement containing speaker and official sentence. The existing live caption announces banter, so it is not a replacement.
- The current reduced-motion sequence advances at 450 ms intervals and ends at 1.6 seconds. Full jokes cannot reasonably be read in those intervals. Preserve readable timing with motion disabled.
- At narrow widths, utility text labels are hidden and the buttons can be identified only by symbols. Give sound and reduced-motion controls explicit localized accessible names.
- The share dialog handles Escape and traps Tab but does not restore focus to its opener after closing. Restore that focus rather than returning the keyboard user to the document start.
- Photo-stage buttons in noninteractive previews use `tabIndex=-1` but remain button elements for assistive technology. Decorative preview faces should not imply actions. Interactive faces should describe their action and current selected state.
- The visible duplicate-name check currently compares trimmed strings, while the engine normalizes compatibility characters and case. Reuse the same normalization to avoid “Cup”/“cup” or width variants passing the UI and failing on start.

These are code-inspection findings, not claims that an accessibility audit or assistive-technology test has been executed in this follow-up.

## Acceptance checks for the redesign

| Check | Completion criterion |
| --- | --- |
| Photo identity | Original composition/aspect ratio remains recognizable; generated decoration does not cover selected objects or replace photo content |
| Immediate response | First face reacts upon start; any claimed timing is measured and recorded, not inferred from a timer constant |
| Readable comedy | Speaker is named, bubble remains short, full caption stays available, reduced motion preserves reading time |
| Fair deduction | Same exact three official statements, no pre-verdict guilty cues, one final accusation, unchanged engine tests |
| Textured controls | Text is real HTML, buttons retain accessible names/state, visible focus and disabled/loading states work without the bitmap |
| Mobile | 360 px and 390 px layouts have no horizontal clipping; entry actions and testimony are usable without reading decorative filler |
| Geometry | Portrait, landscape, and a rotated photo keep faces on their objects through layout changes |
| Keyboard | Casting, listening, selection, accusation, share confirmation, Escape, and focus return remain operable |
| Bilingual | Korean and English fit every button, caption, statement, and result without baked-in language or truncation |
| Sharing | Same ordered actors, photo, statements, dialogue and answer; preview consent and owner deletion still work |
| Evidence | Actual screenshots and executed relevant checks are recorded separately; generated assets and Codex/Kiro provenance are named honestly |

한국어 요약: 수제 탐정 책상처럼 바꾸되 실제 사진과 첫 각성이 중심입니다. 생성 이미지는 배경·버튼 재질·장식 캐릭터에 쓰고, 공식 문장과 조작은 HTML/CSS/SVG로 유지합니다. 기능을 늘리지 않고 읽기 쉬운 대사, 세 증언 비교, 한 번의 지목, 모바일·키보드 조작을 더 명확하게 만듭니다. Kiro는 이번 확인에서도 실행되지 않았습니다.
