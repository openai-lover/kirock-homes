# Kirock Homes: Room of Suspects — factual submission draft

Updated on 2026-11-05 (Asia/Seoul). This is editable English submission material, not a submitted entry. No hosted app URL, published repository, public video URL, user-study result, or competition eligibility is claimed. A local 85.56-second review recording now exists. Actual Kiro CLI work is documented below. Current official rules were rechecked on 2026-11-05. The project deadline is December 4, 2026 at 2 PM PST (December 5 at 7 AM KST).

Current localized title: **킬록 홈즈** (Korean), **Kirock Homes** (English), with **Room of Suspects** retained as the subtitle. The detective mascot is an unofficial fan adaptation, not an official Kiro character release or endorsement. [Current design](kirock-design.md).

## Tagline

Your room. Three suspects. One liar.

## Inspiration

A familiar desk can be more personal than a generic game scene. The idea was to let someone send a friend a tiny mystery inside an ordinary photograph: three recognizable belongings open their eyes and suddenly have opinions.

## What it does

Kirock Homes: Room of Suspects is a short comedy deduction game. Players try a licensed sample desk or upload their own photo, select three objects, and place expressive SVG faces on them. After awakening, players hear three official statements, question each object, and hear another object's objection. Players type questions in a familiar group chat; Kiro interprets the question and recent conversation to select a witness, response intent and another object’s interjection. Authored replies preserve the evidence. They make one accusation after investigating. Only the culprit's official statement is false; the other two are true. A wrong answer still reveals the solution and its explanation.

The full-screen opening sweeps a magnifying glass across a real desk photograph, then introduces Kirock. Its single bottom-left skip control is available immediately. The optional Story screen plays a 15-second living-photo loop: a shutter, waking eyes, a mug demanding a lawyer, the keyboard asking for a coaster, and a question that starts the mystery. Players can pause, step through, or enter the actual game using the same image. It is photo augmentation, not camera-tracked AR.

The game supports English, Korean, Spanish, French, German, Portuguese, Japanese, Simplified Chinese, Arabic and Hindi. English is the default; a language choice is saved for later visits, and Arabic uses RTL text direction. It also supports captions, optional synthesized sound effects, reduced motion, and keyboard interaction. Photo sharing requires a visible preview and consent. On the included local server, a friend link preserves the same photograph, characters, testimony, dialogue, and answer, with an independent play session, expiration, and creator deletion. A remotely reachable deployment is still required for sharing outside the local host.

## How it is built

The application uses Next.js and TypeScript with CSS/SVG face animation. A pure TypeScript reasoning engine enumerates six possible worlds: three culprits multiplied by two event states. It accepts a case only when one complete world survives and removing any one statement leaves at least two possible culprits. Two fictional story settings support the preserved v1 template and new v2 conditional alibis. All 144 permutations per version retain unique solutions and testimony necessity.

Official statements, answers, confessions, and explanations come from code and authored static catalogues in ten languages. No translation API is used, and switching language preserves the case and investigation progress. Optional AI can suggest object candidates, approximate face placement, and approved personalities. It cannot write official testimony or decide guilt. Missing credentials, timeouts, or malformed responses fall back to manual casting and authored dialogue. Live runtime Kiro question interpretation was verified on 2026-11-05, including an actual browser question. Vision recognition and the hosted compatible chat adapter have not been live-tested with credentials.

New shared cases are reconstructed and verified on the server, then frozen in all ten languages. Older links retain their stored text: if the requested language is unavailable, the server returns an available stored version and the UI identifies its language. Missing translations are never regenerated. The delivered SQLite adapter runs on a persistent Node host. Public responses expose only replay material; the first accusation is recorded atomically, and repeated requests return its original result. A production host, persistent disk, HTTPS configuration, and monitored cleanup schedule are still operator work.

## Current group-chat Kiro contribution

Kiro CLI 2.37.0 actually authored the isolated chat-routing validator/fallback, 84 focused tests and three spec files. The run exited 0. Codex implemented the runtime adapter, fixed evidence contract, chat UI, v2 logic and broader verification. A real runtime Kiro check completed in 6.138 seconds; it returns a bounded plan, not unrestricted dialogue prose. [Exact records](kiro/group-chat-README.md). No contest-credit balance or redemption was verified.

## Development provenance (earlier work)

The original game, solver, sharing server, photo editor, generated visual assets, cross-examination scripts and UI integration were produced with **Codex**. After the user completed sign-in, **Kiro CLI 2.37.0** actually read the source, wrote the manual hypothesis builder and React board, authored tests and specification/steering files, and ran targeted hypothesis plus engine regression tests.

The task addressed the first version's weak gameplay loop: reading three statements and clicking an answer. Codex added scripted confrontations; Kiro added the player-controlled deduction scratchpad. [Development provenance](kiro-usage.md) links the prompt, output, exact test evidence and file hashes. `.kiro/specs/detective-hypotheses/` and `.kiro/steering/game-invariants.md` were created in the actual Kiro run. No Kiro hook, IDE-native spec workflow, or Kiro browser verification is claimed.

Kiro later implemented the six-stage detective guidance and aside component. In the [ten-language expansion](kiro/ten-languages-README.md), it authored or extended six source/test files: the secondary UI catalogue, detective stage copy, three UI components and focused tests. The first test command failed on a French string quote; after Kiro corrected it, the same command passed **19 tests**. Kiro wrote requirements/design, then the service throttled the response stream and the process ended with **exit code 1**, before a final report or tasks checklist. Codex wrote the observed tasks record and owns the main UI, game-content translations, server changes, RTL integration and broader validation. Completed files and focused tests are real contributions; the interrupted agent run is not described as an end-to-end success.

On November 4, Kiro authored a seven-kind decorative SVG prop component and three accompanying spec files. Its initial typecheck found a JSX namespace error; Kiro repaired it and the same command then returned exit 0. The agent run completed with exit 0. Codex corrected a comment and redundant cast, integrated the props, generated the new entrance/material assets and performed the production/browser verification. [Recorded run](kiro/attraction-run.json).

The [official Kiroween 2026 rules](https://kiroween.devpost.com/rules) require actual Kiro use, a root `.kiro` directory and a write-up. This records the contribution performed; it does not guarantee judging or eligibility.

## Challenges addressed in the implementation

- Maintaining a fixed event subject when witness roles change. A statement about a lamp must keep referring to that lamp even when another object speaks.
- Keeping the photographed object recognizable while aligning faces to normalized image coordinates after resizing and rotation.
- Preventing character comedy and AI output from altering the deductive rules or signaling guilt before the verdict.
- Preserving one case across friend visits while withholding private solution material from public responses.
- Ensuring repeated accusation requests cannot change a recorded answer, and deleting stored images alongside their case data.

## Evidence to attach

Use [the current preflight validation record](preflight-validation.md) for exact executed checks and outcomes: 169 unit/server/solver tests and all 63 current browser tests passed, including two different licensed real photographs and small mobile layouts. [Earlier validation](validation-results.md) retains its historical scope and does not establish later results. Include only results tied to the delivered revision. The automated fixtures and simulated browser viewports do not establish native-speaker review, physical-device compatibility, recognition accuracy, or human enjoyment.

The sample photograph is a licensed Pexels image by Elena Golovchenko. [Asset attribution](assets.md) identifies its license, the Codex-generated decorative images and local font licenses. SVG faces are implemented in source. [Development provenance](kiro-usage.md) distinguishes actual Codex and Kiro contributions.

## What remains

- Review the recorded Kiro contribution for the submission write-up. A hook remains unperformed and must not be claimed.
- Provision a persistent public Node host, HTTPS URL, durable storage, and monitored cleanup; verify the deployed share/delete/expiry behavior.
- Verify a chosen real AI account/model only if the optional recognition feature is advertised as live; retain manual mode regardless.
- Two additional real photos completed the automated portrait/landscape flows. Physical iPhone and Android interaction testing remains unperformed.
- Observe consenting human players and report actual completion, understanding, timing, and humor feedback without invented metrics.
- Publish the source with its lockfile, source license, and photo attribution; review and publish the recorded demo video.
- Confirm current contest eligibility, entry requirements, and project submission details, then submit through the user's own account. Participant registration was observed as complete; the user reported submitting the credit application. Credit receipt/approval/payment and project submission were not independently confirmed. [Registration and credits record](kiro-credits-2026.md).

## Local recorded demo — ready for review, not published

[Review video](demo/kirock-homes-review.webm), [English captions](demo/kirock-homes-review.en.srt), and [recording provenance](demo/recording.json). Actual local browser gameplay: opening, living-photo story, upload of a different licensed landscape photo, manual casting, three statements, a typed question, a real Kiro response and final verdict. A labelled closing card summarizes preserved Kiro development evidence; it is not a new terminal run. Container duration: 85.56 seconds at 1280 × 900. Chrome playback was verified through the end. No audio narration or YouTube upload is claimed.

## Optional 2:45 storyboard — longer version not recorded

This is an optional longer recording plan; the shorter real recording above is already available. Record the actual final app and recorded Kiro contribution; label fixtures, cuts and time compression. Do not show private photos, credentials or hidden answer data before the reveal.

| Time | Actual screen to record | Suggested English narration / caption |
| --- | --- | --- |
| 0:00–0:08 | First SVG eyes open on a recognizable object | “An ordinary desk. Then the keyboard gets a mouth.” |
| 0:08–0:22 | Title and sample/local-photo entry | “Kirock Homes turns a familiar photo into a short mystery.” |
| 0:22–0:40 | Upload, choose three objects, adjust faces | “Choose three objects. Place their faces. Wake them up.” |
| 0:40–1:15 | Photo shutter, awakening, three statements and a typed question with a reply/interjection | “The objects join your group chat. Ask a question, then compare their exact words.” |
| 1:15–1:35 | Final accusation, reaction, three-step proof | “One accusation. A fair answer, even when you get it wrong.” |
| 1:35–1:48 | Confirm photo sharing; open the same case in an independent browser | “A friend plays the same case, with their own decision.” Label local-host footage if no public deployment exists. |
| 1:48–2:18 | Actual Kiro group-chat spec, routing module and recorded 84-test output | Explain the bounded routing contract and show the actual runtime result. Distinguish Kiro-authored routing from Codex integration. Do not claim a hook, unrestricted generated dialogue or Kiro browser test. |
| 2:18–2:35 | Executed solver/browser checks and a genuine result record | Describe what was tested and its limits. Include human findings only after a real study. |
| 2:35–2:45 | Final game screen and verified public app address, if deployed | “Your room. Three suspects. One liar.” |

Korean note: 이 문서는 제출 초안과 **아직 녹화하지 않은** 영상 구성안입니다. Kiro의 실제 가설 보드·탐정 안내·10개 언어 보조 UI 개발 기록은 있습니다. 이전 10개 언어 Kiro 실행은 집중 테스트 19개 통과 후 서비스 제한으로 종료 코드 1이 발생했습니다. 11월 4일 새 소품 컴포넌트 실행은 타입 오류 수정과 검사 통과 후 종료 코드 0으로 완료됐습니다. 공개 배포·사용자 실험·실기기 검증·영상 업로드는 아직 완료하지 않았고, 작품 제출·크레딧 승인을 확인한 기록도 없습니다.
