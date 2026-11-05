# Kirock Homes · 킬록 홈즈

**Your photo. A room full of suspects. One liar.**

[Play online](https://kirock-homes.vercel.app) · [96-second Crew demo](https://youtu.be/7gknqGSknDk) · [Source](https://github.com/openai-lover/kirock-homes)

The public demo uses Vercel Hobby and Turso Starter free storage. No card was added and no paid service was enabled. Public AI providers are disabled: manual photo casting and authored interactive chat work without an account. The optional Crew edition provides real photo recognition and generated dialogue using the player’s own Kiro allowance.

사진 속 물건 셋이 눈을 뜨고, 당신과 킬록이 있는 단톡방에 들어옵니다. 사건 설명과 공식 증언을 하나씩 듣고 직접 질문하세요. 관련 물건이 답하고 다른 물건이 반론에 끼어듭니다. 마지막 지목은 한 번입니다.

A photo becomes a group-chat mystery. Wake three objects, hear the case one message at a time, type questions, compare their replies and make one accusation. English is the default; ten languages, Arabic RTL, keyboard controls, captions, mute and reduced motion are included.

The opening now sweeps a brass magnifier across the desk with a 1.22× optical crop, then introduces Kirock. **Story** is a 15-second living-photo loop: shutter → waking faces → a mug/keyboard exchange → your question → Kirock's handoff. Pause, step through, or enter the real game immediately with the same photo. Reduced motion starts the story paused. English/Korean GIF exports are in `public/art/living-photo-story-{en,ko}.gif`; the app uses the same scene as responsive HTML/SVG for localized text and playback controls. There is no four-panel comic. The bundled photograph is licensed stock, and this is photo augmentation rather than live camera tracking. The GIFs were rendered from the app, **not generated natively by GPT**; the available image tool returned a static PNG.

The intro now prepares its photograph and character before the sweep, shows a branded first frame during loading, and pauses when the tab is hidden. A single bottom-left **Skip intro** control restores keyboard focus. Entry buttons are text-only with centered 17–18 px labels. Short mobile viewports keep the chat composer visible above the keyboard using the browser’s visual viewport. Desktop simulations do not establish physical iPhone or Android compatibility.

## Run

Use **Node.js 24 LTS** (the verified Vercel runtime); SQLite requires at least 22.13.0. The latest verification used **Node 24.19.0**, Next.js **16.4.3**, React **19.3.1**, TypeScript **5.9.3** and the included `package-lock.json`. Production builds use the bundled Webpack (`next build --webpack`), because the Next 16.4.3 Turbopack adapter omitted runtime dependencies on Vercel.

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

## Optional live Kiro and Crew edition

**The optional [Kiro Crew app](https://github.com/openai-lover/kirock-homes-crew) now uses your own Kiro for real photo recognition and fresh character dialogue.** The [web edition](https://kirock-homes.vercel.app) remains an instant, account-free game with manual casting and scripted replies. [Installation guide](https://kirock-homes.vercel.app/crew).

Kiro identifies three photographed objects and approximate face positions; the player corrects them. With explicit chat consent, Kiro reads the question, public statements and recent conversation, generates one or two character reactions, then a separate Kiro call reviews them. Code validates speakers/references and inserts exact quotations. No private solution enters the model payload. The model could infer guilt from public clues, so semantic review is probabilistic, not a mathematical no-leak guarantee. Failed or rejected responses return scripted replies.

Kiro CLI 2.37.0 actually authored the performance validator, 107 tests and three specs. It also executed **131 engine/performance/integration tests**, including both 144-variant deduction families. Codex authored runtime integration, Crew packaging, UI and broader verification. [Actual records and precise attribution](docs/kiro/live-dialogue/README.md). Earlier routing-only and Kiro development records remain historical evidence.

The real Crew UI recording includes successful photo casting, two generated/reviewed character turns, an adversarial request handled by scripted refusal, and a verdict. A separate five-question runtime check produced five accepted live turns. These are small observed checks, not a recognition benchmark or user study.

Crew requires Node 24, official Crew 0.11.2+ and a signed-in CLI. Its backend binds to localhost, verifies Crew proxy signatures, caps attempts at 20 per UTC day, and permits one concurrent request. A chat attempt may consume two model calls. This is an attempt cap, not a currency guarantee. The app never purchases credits or enables overages. Runtime sessions deny all tools for dialogue; vision may read only its temporary JPEG. Kiro may retain its own session history; temporary images are removed by this adapter after the call.

For local Next.js testing (not public hosting), set these in your unshipped `.env.local`:

```dotenv
AI_PROVIDER=kiro
CHAT_PROVIDER=kiro
CHAT_PERFORMANCE=true
KIRO_CLI_PATH=/absolute/path/to/kiro-cli
KIRO_HOME=/absolute/path/to/your/authenticated/kiro/home
```

The Kiro adapters are loopback-only. Never upload or share a Kiro login/session home. Public shared games keep frozen authored dialogue; the Crew edition does not publish photos or friend links.

## Fixed deduction, fair uncertainty

The pure TypeScript engine is separate from UI, AI and storage. It enumerates all six worlds: three culprits × two event states. Only the culprit's official statement is false. Every approved variant has exactly one solution world; removing any statement leaves at least two culprit candidates.

New cases use version 2, **conditional alibis**, instead of one witness simply naming the culprit without a condition. A witness's “if” statement must be judged as a whole. Both story settings, all role permutations, state inversions and display orders are checked: **144 variants per version, 288 total**. The lamp/event subject stays fixed when speaking roles shuffle. Version 1 is still validated for old drafts; stored shared snapshots are never rewritten by the new template. Explanations and confessions come from code/static catalogues, not AI. Pre-verdict faces are independent of guilt.

## Sharing and storage

The local SQLite adapter runs on one persistent Node host. Vercel uses the remote Turso/libSQL adapter selected by `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. The owner must review the exact photo and approve sharing. A shared case freezes the photo, faces, official statements, authored character lines, interrogation material and answer in its supported languages. Each friend gets an independent play session. Free questions are individual conversations about that fixed material, not additional official evidence. Public responses contain no answer, confession, structural claims or explanation before accusation. Repeated accusations return the first recorded verdict.

Links expire in seven days. Owner-cookie deletion removes the photo and case. Locally, startup/hourly cleanup removes expired data while the server runs. Vercel rejects expired links immediately and uses a daily authenticated cleanup plus cleanup on new shares to remove expired rows. Outages may delay physical cleanup; provider backups follow the provider's retention. A stopped computer cannot perform local cleanup. Copies saved by recipients cannot be recalled. Deletion authority cannot be recovered from another device.

**127.0.0.1 is local only.** See [Vercel deployment](docs/vercel-deployment.md) for the remote storage adapter, cleanup scheduler and production checks. Serverless deployments fail closed if storage credentials are missing; they never use disposable local files for shared cases.

## Submission review

[Actual local demo video](docs/demo/kirock-homes-review.webm) (85.56 seconds), [English captions](docs/demo/kirock-homes-review.en.srt), and [English submission draft](docs/submission.md) are included. The recording shows a different real photo and a live Kiro-interpreted question; it is [published on YouTube](https://youtu.be/zGdqdS0ssVY). The [public source repository](https://github.com/openai-lover/kirock-homes) is available. The final Devpost submission is separate from publishing these materials.

## Source and evidence

- [Public deployment validation and unrun checks](docs/production-validation.md)
- [Earlier full browser preflight](docs/preflight-validation.md)
- [Design and interaction contract](docs/group-chat-design.md)
- [Kiro execution, prompt and file hashes](docs/kiro/group-chat-README.md)
- [Photo-first story and unused artwork exploration](docs/group-chat-art.md)
- [Architecture](docs/architecture.md), [factual submission draft](docs/submission.md), [remaining Kiro work](KIRO_HANDOFF.md)
- [Sample photo, fonts and artwork licenses](docs/assets.md)
- [Original supplied plan](reference/KIROWEEN_2026_PLAN.md)

The Kirock mascot is an unofficial fan adaptation, not an official Kiro release or endorsement. Contest entry registration and credit application are separate from project submission, credit approval and redemption; see [recorded credit status](docs/kiro-credits-2026.md).

Source code: [MIT](LICENSE). Sample: *A Lamp on a Computer Desk* by Elena Golovchenko, under the separate [Pexels License](https://www.pexels.com/license/). The final archive excludes `.env.local`, authenticated sessions, personal photos, databases, `node_modules`, `.next` and local test caches. `npm run package` writes `dist/KIROCK_HOMES_SOURCE.zip` and a SHA-256 source manifest.
