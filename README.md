# Kirock Homes · 킬록 홈즈

**Your photo. A room full of suspects. One liar.**

사진 속 물건 셋이 눈을 뜨고, 당신과 킬록이 있는 단톡방에 들어옵니다. 사건 설명과 공식 증언을 하나씩 듣고 직접 질문하세요. 관련 물건이 답하고 다른 물건이 반론에 끼어듭니다. 마지막 지목은 한 번입니다.

A photo becomes a group-chat mystery. Wake three objects, hear the case one message at a time, type questions, compare their replies and make one accusation. English is the default; ten languages, Arabic RTL, keyboard controls, captions, mute and reduced motion are included.

The opening now sweeps a brass magnifier across the desk with a 1.22× optical crop, then introduces Kirock. **Story** is a 15-second living-photo loop: shutter → waking faces → a mug/keyboard exchange → your question → Kirock's handoff. Pause, step through, or enter the real game immediately with the same photo. Reduced motion starts the story paused. English/Korean GIF exports are in `public/art/living-photo-story-{en,ko}.gif`; the app uses the same scene as responsive HTML/SVG for localized text and playback controls. There is no four-panel comic. The bundled photograph is licensed stock, and this is photo augmentation rather than live camera tracking. The GIFs were rendered from the app, **not generated natively by GPT**; the available image tool returned a static PNG.

The intro now prepares its photograph and character before the sweep, shows a branded first frame during loading, and pauses when the tab is hidden. A single bottom-left **Skip intro** control restores keyboard focus. Entry buttons are text-only with centered 17–18 px labels. Short mobile viewports keep the chat composer visible above the keyboard using the browser’s visual viewport. Desktop simulations do not establish physical iPhone or Android compatibility.

## Run

Node.js **22.13.0+** is required for SQLite. Actual execution used **Node 25.9.0**, Next.js **16.4.3**, React **19.3.1**, TypeScript **5.9.3** and the included `package-lock.json`.

```bash
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). No external account or API key is required for sample play, manual photo selection, authored chat replies or local sharing.

```bash
npm run typecheck
npm test
npm run test:e2e
npm run build
npm start
npm run package
```

The browser suite uses installed macOS Chrome when available, otherwise Playwright Chromium (`npx playwright install chromium`). It reuses a running local server. Current executed results and limitations are in [submission preflight validation](docs/preflight-validation.md). Earlier [opening/story validation](docs/lens-story-validation.md) and [group-chat validation](docs/group-chat-validation.md) retain their historical scope. Historical notebook/comic UI tests are preserved in `tests/legacy-e2e`; they are not counted as current passing tests. To regenerate the two GIFs with the app running, use `node scripts/export-story-gif.mjs`.

## Play

1. Try the sample, or choose JPG/PNG/WebP up to 10 MB / 24 megapixels. HEIC requires conversion. Place faces on three objects; adjust positions, size and tilt if needed.
2. Objects awaken on the original photo. Advance through the case introduction and three official statements in the chat.
3. Type a question or choose a suggested question. The `@` selector lets you address an object or Kirock. Enter sends; Shift+Enter adds a line. Replies may quote another witness and prompt an interjection.
4. Open **Case notes** when you want all the evidence together. After all three statements and at least one question, **I’m ready to accuse** opens a separate confirmation. Selection is reversible; confirmation is not.
5. Correct and wrong answers both reveal the code-owned explanation. Sharing remains optional and requires a photo preview and explicit publication consent.

The photo can be expanded on mobile. English, 한국어, Español, Français, Deutsch, Português, 日本語, 简体中文, العربية and हिन्दी are available. The selected language persists in `localStorage`. Translations are authored static text; switching languages does not regenerate the case.

## Actual Kiro connection and its limits

**Kiro was actually used for development and for a live game question.** Kiro CLI 2.37.0 authored the pure chat routing module, 84 focused tests, and three specification files. The recorded run exited 0. Codex integrated the group-chat UI, server adapters, photo story, localized dialogue and new logic family. [Exact attribution and records](docs/kiro/group-chat-README.md).

The runtime adapter reads the player's question, object roles, public statements and recent conversation. Kiro returns a strictly validated **speaker, intent, reference, tone and interjection choice**. The game renders authored lines and inserts official testimony verbatim. This is AI interpretation of free input with bounded responses, not unrestricted generative dialogue. It cannot invent alibis, change guilt, create a fourth clue, paraphrase testimony or disclose a hidden answer. Off-topic or unrecognized questions may get a repeated statement or Kirock's general guidance.

The UI indicates whether a turn used Kiro or scripted replies. In the current local developer environment, Kiro is enabled via an unshipped `.env.local` pointing to the user's existing authenticated CLI. A real provider check completed in **6.138 seconds**; an actual Korean question was also exercised through the browser. This proves an authenticated call, not any particular credit balance, contest-credit approval, redemption or billing source.

To configure your own **local** session, copy `.env.example` to `.env.local` and set:

```dotenv
CHAT_PROVIDER=kiro
KIRO_CLI_PATH=/absolute/path/to/kiro-cli
KIRO_HOME=/absolute/path/to/your/authenticated/kiro/home
```

Only the verified 2.37.0 V2 CLI flags are claimed. Authentication is performed directly with Kiro. Never copy another person's authenticated home or commit it. The game uses an isolated working directory, no tools, no repository resources and no MCP in runtime sessions. Player text still goes to Kiro and may be retained by its service/local session history according to its policies. The photo and private solution are not in the model payload.

For a hosted game, provision a separate HTTPS Chat Completions-compatible account/model using `CHAT_PROVIDER=openai-compatible`, `CHAT_BASE_URL`, `CHAT_MODEL`, `CHAT_API_KEY`. That adapter is implemented but has not been live-tested with credentials. The Kiro adapter is limited to loopback Host requests; do not expose your developer CLI session as a public service.

The model has 20 seconds; failure, invalid output or missing credentials returns an authored local reply. **Continue without AI** ends the player's wait. Request caps survive restarts: default 40/day, 200 total, 24 per case/hour. These count attempts, not credits or currency. Zero disables chargeable requests. Identical requests are deduplicated for one hour. The app cache stores hashes and validated plans, not questions or photos. Already-started calls can still count if the browser cancels.

Optional **photo recognition is separate**: set all `AI_PROVIDER`, `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY` values in `.env.example`, and explicitly consent before sending a resized photo. Live vision recognition has not been tested with credentials; manual placement remains fully playable.

## Fixed deduction, fair uncertainty

The pure TypeScript engine is separate from UI, AI and storage. It enumerates all six worlds: three culprits × two event states. Only the culprit's official statement is false. Every approved variant has exactly one solution world; removing any statement leaves at least two culprit candidates.

New cases use version 2, **conditional alibis**, instead of one witness simply naming the culprit without a condition. A witness's “if” statement must be judged as a whole. Both story settings, all role permutations, state inversions and display orders are checked: **144 variants per version, 288 total**. The lamp/event subject stays fixed when speaking roles shuffle. Version 1 is still validated for old drafts; stored shared snapshots are never rewritten by the new template. Explanations and confessions come from code/static catalogues, not AI. Pre-verdict faces are independent of guilt.

## Sharing and storage

The included SQLite adapter runs on one persistent Node host. The owner must review the exact photo and approve sharing. A shared case freezes the photo, faces, official statements, authored character lines, interrogation material and answer in its supported languages. Each friend gets an independent play session. Free questions are individual conversations about that fixed material, not additional official evidence. Public responses contain no answer, confession, structural claims or explanation before accusation. Repeated accusations return the first recorded verdict.

Links expire in seven days. Owner-cookie deletion removes the photo and case. Startup/hourly cleanup removes expired data while the server runs; use `npm run cleanup` under an external scheduler if continuous deletion is required while the game process is stopped. A stopped computer cannot perform cleanup. Copies saved by recipients cannot be recalled. Deletion authority cannot be recovered from another device.

**127.0.0.1 is local only.** A friend on another computer needs a reachable, persistent host, HTTPS, durable disk and `APP_ORIGIN`. No public deployment is provided. The local SQLite adapter is not appropriate as-is for ephemeral serverless storage or distributed instances. Deployment and production monitoring remain operator work.

## Submission review

[Actual local demo video](docs/demo/kirock-homes-review.webm) (85.56 seconds), [English captions](docs/demo/kirock-homes-review.en.srt), and [English submission draft](docs/submission.md) are included. The recording shows a different real photo and a live Kiro-interpreted question; it is not yet published on YouTube. A public app/build and public source repository must still be provided before contest submission.

## Source and evidence

- [Current validation and unrun checks](docs/preflight-validation.md)
- [Design and interaction contract](docs/group-chat-design.md)
- [Kiro execution, prompt and file hashes](docs/kiro/group-chat-README.md)
- [Photo-first story and unused artwork exploration](docs/group-chat-art.md)
- [Architecture](docs/architecture.md), [factual submission draft](docs/submission.md), [remaining Kiro work](KIRO_HANDOFF.md)
- [Sample photo, fonts and artwork licenses](docs/assets.md)
- [Original supplied plan](reference/KIROWEEN_2026_PLAN.md)

The Kirock mascot is an unofficial fan adaptation, not an official Kiro release or endorsement. Contest entry registration and credit application are separate from project submission, credit approval and redemption; see [recorded credit status](docs/kiro-credits-2026.md).

Source code: [MIT](LICENSE). Sample: *A Lamp on a Computer Desk* by Elena Golovchenko, under the separate [Pexels License](https://www.pexels.com/license/). The final archive excludes `.env.local`, authenticated sessions, personal photos, databases, `node_modules`, `.next` and local test caches. `npm run package` writes `dist/KIROCK_HOMES_SOURCE.zip` and a SHA-256 source manifest.
