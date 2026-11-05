# Architecture and contracts

This document describes the implemented application, not every proposed feature in the supplied plan. The project is one Next.js/TypeScript application. CSS and inline SVG animate faces on the original photograph; no generated replacement character image is required. Local sample and manual-photo games do not require an account or API key.

## Boundaries

| Area | Source | Responsibility |
| --- | --- | --- |
| Game flow | `src/components/Game.tsx` | Casting, awakening, testimony collection, cross-examination, manual hypotheses, one accusation, reveal, disclosure preview, sharing |
| Photo actors | `src/components/PhotoStage.tsx` | Image-relative SVG eyes/mouths, face selection and movement; verdict expressions only after resolution |
| Image preparation | `src/lib/image/normalize.ts` | Browser decoding/orientation, size limits, JPEG re-encoding, rotation, normalized pointer coordinates |
| Reasoning and authored text | `src/lib/game/` | Structured claims, six-world solver, approved variants, input validation, static statements and explanations in ten languages |
| Interface languages | `src/lib/i18n/`, `src/lib/ui/detective-voice.ts` | Shared locale registry, static UI/credits catalogues and detective guidance; English default and Arabic RTL |
| Optional recognition | `src/lib/ai/` | Replaceable provider interface, bounded output validation, timeout/manual fallback |
| Private shared state | `src/lib/server/` | Server-only image validation, durable storage, owner/play authorization, expiration and deletion |
| HTTP boundary | `src/app/api/` | Bounded JSON, explicit consent, same-origin mutations, cookies, public response allowlists |

The engine imports no UI, AI, filesystem, network, or framework module. The UI and server use the same canonical engine contract. Server implementation modules import `server-only` and must not be imported by client components.

## Reasoning contract

`SuspectId` is `s0 | s1 | s2`; IDs are stable identities, not guilty/innocent labels. Three distinct objects each have a name, approved kind, approved personality, and face `{x, y, scale, rotation}`. Coordinates are relative to the normalized image: `x`/`y` are in `[0,1]`, scale is `[0.08,0.3]` of its shorter side, and rotation is degrees. The renderer uses the actual image rectangle rather than the surrounding layout.

There are two structural claim types:

```ts
type Claim =
  | { type: "culprit_is"; suspectId: SuspectId }
  | { type: "fact_is"; value: boolean };

type World = { culpritId: SuspectId; fact: boolean };
```

The solver enumerates exactly six worlds: three possible culprits multiplied by the two binary fact states. A world survives only when every present statement's truth value equals `speakerId !== culpritId`. A valid full puzzle must have exactly one surviving complete world. Removing any one official statement must leave at least two distinct possible culprits. Removing a statement removes its constraint; it does not remove that object from the possible worlds.

The approved `opposed-facts`, version 1 template gives role A one fact assertion, role B its opposite, and role C a direct accusation of A. It supports six role permutations, two fact inversions, and six display permutations: **72 variants per story, 144 across the two stories**. These are variations of one logical puzzle family, not 144 independent puzzle types. `createCase` randomizes roles and display order independently. A supplied seed makes generation reproducible for tests. The sample photo does not make any particular object permanently guilty.

The coffee story's binary fact is whether a selected lamp was on at the spill. `factSubjectId` stays fixed when logical roles and display order change. A witness says “I” only if that witness is the selected lamp. Without a lamp, the generic sticker story uses a fictional bell ringing before or after midnight; the fact has no object subject. Both stories explicitly identify their past events as fictional, so the present photo's lighting is not evidence.

`validateDraft(unknown)` performs runtime validation and reconstructs the approved template. It checks exact field sets, approved versions, story/fact pairing, role and display permutations, three distinct names/IDs, supported kinds/personalities, coordinates, and exact structural claims. It rejects caller-supplied solution, explanation, or official-text fields. It returns a detached canonical copy; neither sharing nor validation generates a new puzzle.

`publicSnapshot(draft, locale)` returns only `locale`, `title`, `context`, ordered `suspects`, rendered `statements`, `characterLines`, `interrogations`, and `factLabels`. `resolveCase(draft, accusedId, locale)` returns the verdict, actual culprit, binary state, confession, and three proof steps. Every supported language renders the same structural claims. The explanation derives from the validated world and template; AI does not produce or paraphrase it.

The shared locale registry supports English, Korean, Spanish, French, German, Portuguese, Japanese, Simplified Chinese, Arabic and Hindi (`en`, `ko`, `es`, `fr`, `de`, `pt`, `ja`, `zh`, `ar`, `hi`). English is the default regardless of browser language. The native language selector saves an explicit choice in `localStorage` under `kirock:locale`, including on the credits/privacy page. Arabic uses RTL text direction. Interface, evidence and character text use bundled static catalogues, without a translation API. Changing language does not recreate the draft, change the culprit or reset investigation progress.

Authored first lines and personality lines depend only on object kind/personality. They contain no alibi, guilt, or event-state claims. Pre-verdict faces receive no culprit value. The guilty/innocent expression input is supplied after a verdict. The sample and manual local games intentionally evaluate their solution in the browser. Answer-hiding applies to the shared friend-play responses; this is spoiler protection, not a competitive anti-cheat system.

## Photo handling and sharing

Browser input supports JPG, PNG, and WebP, with a 10 MB input limit and 24-megapixel decoded limit. It requests EXIF-aware decoding, resizes the long edge to at most 1600 px, and draws a new JPEG, targeting at most 1 MB. Unsupported formats and decode/size failures show an actionable fallback. Manual face coordinates belong to this normalized image. Replacing a photo requires casting again.

Unshared manual play keeps its photograph in the browser. Optional recognition sends the resized image only after the analysis disclosure is selected. Creating a share requires a separate actual-photo preview and affirmative photo-publication consent. The server independently decodes accepted image bytes with Sharp, checks real format/dimensions, applies orientation, and re-encodes without input metadata.

`ShareStore` is the replacement boundary for storage. The included `SqliteShareStore` uses Node's `node:sqlite` on a persistent Node host. Its default file is `.data/room-of-suspects.sqlite`; `SHARE_DB_PATH` can select another private persistent path. It is not an ephemeral/serverless or multi-region database adapter. No Supabase credentials are needed for the delivered local implementation. A remote storage adapter would need the same lifecycle and authorization guarantees before deployment.

At creation, the server validates the draft, then freezes all ten languages' public snapshots and all possible post-verdict responses. The image and private material are inserted in one database row, avoiding a separate orphan-image upload. Friend visits never regenerate a mystery or request new AI dialogue. The original file may be resized/re-encoded during normalization, while the visible composition, normalized faces, names, official testimony, dialogue, and answer stay fixed for the shared case.

Older shares retain exactly the snapshots and results already stored. A requested translation is available only when both its snapshot and verdicts exist. Otherwise the server selects stored English, or the first stored language in registry order if English is absent. It returns the actual content `locale` and `availableLocales`; the UI identifies the fallback and gives the preserved content its own language/direction attributes. Missing translations are never generated from current catalogues. The interface may use the selected language while an older case keeps its original evidence language.

The public share ID is 24 cryptographic random bytes, base64url encoded. The owner authority is a different secret stored in a SameSite=Strict, HttpOnly cookie; the database stores its hash. Shared plays get a separate cookie authority and random play ID. Owner and play rights are not interchangeable. Cookies are Secure on HTTPS. A browser can begin its own play of the same case without changing another friend's accusation.

The first accusation is saved in a SQLite `BEGIN IMMEDIATE` transaction. Later duplicate requests, including a different accused object, return the original accusation's frozen result. Changing language selects an available frozen translation of that same result, using the same legacy fallback rule. The public GET response uses an explicit allowlist and contains no solution, confession, proof, structural claims, role assignment, or fact inversion. Shared images are served through a no-store route that rechecks the case's active status on every request; there is no separately exposed bucket URL or signed-image URL to revoke.

Personal shares expire after exactly seven days. Public reads, image reads, play creation, and verdict access check expiration. Owner deletion removes the case/image row and cascades to its play rows. SQLite secure-delete is enabled. Cleanup also deletes expired cases/play sessions and expired AI request records. The running Node process cleans up at startup and hourly; `scripts/cleanup.ts` provides an explicit job and emits success/failure counts without photographs, object names, tokens, or IDs. To promise the plan's “within 24 hours after expiry” deletion policy on a deployed service, the operator must keep that process running or schedule this job on the persistent host. An offline host cannot run its cleanup timer. Copies already saved by recipients are outside the application's control.

## Optional AI adapter

`VisionProvider.analyzeObjects(dataUrl, signal)` is the provider boundary. A provider may suggest 3–6 object names, kinds, approximate face positions, and approved personality IDs. The output validator constructs an allowlisted result; any supplied testimony, guilt, confession, or invented dialogue fields are discarded. The UI still lets the user inspect and adjust suggestions.

The included optional implementation accepts a configured HTTPS Chat Completions-compatible endpoint, a vision-capable model selected by the operator, and a server-only key. There is no assumed provider account or default paid model. With missing configuration, the API returns an honest `manual/not_configured` result. Production does not display test fixtures as real recognition. Timeout, malformed output, invalid coordinates, and provider failure return a manual fallback with authored dialogue.

Server analysis has an eight-second timeout and bounded response size. The client also guards against late responses overwriting user edits or a confirmed casting. SQLite deduplicates request IDs and enforces configured daily/total request budgets and at most two attempts for the same normalized image within 15 minutes. Each accepted analysis invokes the provider once. Neither investigation, verdict, nor shared replay calls the AI provider. Deduplication records contain an image hash and bounded candidate response for 15 minutes, not stored photo bytes. Provider data-handling terms and a real vision-capable deployment remain external configuration work; a mocked-adapter test is not evidence of a live paid API call.

## Verification scope

`tests/engine.test.ts` exhaustively checks all 144 variants, each of the six worlds, all three omitted-witness combinations, explanations in all ten languages and every possible verdict, fixed lamp subjects/pronouns, seeded variation, public-field allowlisting, guilt-independent banter, and tampered input rejection. It includes intentionally invalid ambiguous, contradictory, and redundant puzzles to ensure validation rejects them.

`tests/server.test.ts` covers frozen ten-language snapshots, legacy original-content fallback, independent play rights, repeated accusations, restart persistence, owner-only deletion, expired public/image/play/verdict access, cleanup, input consent, actual route handlers, no-store responses, bounded request bodies, metadata stripping, and persistent AI budgets. `tests/ai.test.ts` covers missing configuration, delayed and malformed responses, validated candidate fields, and a mocked compatible-provider call.

Executed commands, test counts, browser/build outcomes, and limitations for the current expansion are recorded in [ten-languages-validation.md](ten-languages-validation.md). [validation-results.md](validation-results.md) preserves the original baseline and earlier report links; earlier results do not validate a later revision. The current unit-test command uses Node's `--import tsx` loader; an earlier direct `tsx` CLI attempt was blocked by the execution sandbox's IPC restriction before tests began. Automated suites use generated image fixtures and mocked AI responses. They do not establish live-provider operation, physical iPhone/Android support, native-speaker review, human-study outcomes, deployment readiness, or actual Kiro use.

## 한국어 요약

추리 엔진은 UI·AI·저장소와 분리되어 있고, 범인 세 명과 사건 상태 두 개로 만든 여섯 세계를 모두 검사합니다. 두 이야기의 총 144개 승인 변형에 대해 유일한 정답 세계와 세 증언의 필요성을 검사합니다. 물건 역할을 섞어도 사건 사실의 대상은 유지합니다. 공식 증언·정답·해설·기본 대사는 코드가 결정합니다.

샘플과 비공유 사진 게임은 브라우저에서 판정합니다. 기본은 영어이며, 정적 카탈로그로 10개 언어를 제공합니다. 새 공유 게임은 서버에서 검증한 10개 언어 스냅샷을 저장하고, 공개 응답에서 정답·자백·해설을 제외합니다. 예전 링크에 요청한 번역이 없으면 이미 저장된 원문으로 표시하고 이를 알립니다. 번역을 새로 만들거나 사건을 바꾸지 않습니다. 첫 지목은 원자적으로 고정되며 중복 요청에도 바뀌지 않습니다. 로컬 SQLite 저장소는 키 없이 동작하지만 지속 실행되는 Node 호스트와 영구 디스크가 필요합니다. 7일 만료와 삭제는 구현되어 있고, 운영 중 만료 후 24시간 이내 정리를 보장하려면 시간별 정리 프로세스 또는 별도 예약 작업을 실제로 유지해야 합니다.

AI 키가 없거나 응답이 잘못되면 수동 선택으로 계속합니다. 실제 유료 AI 호출, 실기기 촬영 사진 검증, 배포, 사용자 실험, Kiro 사용 여부는 실행한 증거가 있을 때만 별도로 기록합니다.

## Cross-examination and manual hypotheses (2026-10-31 expansion)

The investigation now has three stages before a verdict: hear the exact three statements; question each speaker and hear a different object's rebuttal; compare manually retained worlds. `CrossExamination.tsx` requires each question → rebuttal → saved-note route before enabling final accusation. Spoken dialogue updates the active photo face and caption. The final accusation remains the existing server-atomic, one-time action. Progress is a client UX gate, not a server authorization boundary.

`interrogation.ts` builds authored exchanges in all ten languages from validated claims and their exact rendered public strings. It never calls the solver or reads the solved culprit/state. Object-kind voice prefixes add comedy without claiming new event facts. Citation IDs refer to the original three statements; no fourth evidence item is created. Tests exercise all 144 approved variants and every supported language, including fact-subject identity and exact quotations.

New public snapshots include `interrogations` and a two-element `factLabels` tuple ordered false/true. Both fields are frozen in all ten languages when a share is created. The public allow-list includes only these replay fields, never resolution metadata. Older frozen shares without these fields keep their original shorter flow; older shares with them preserve their stored exchanges and available languages. Tests verify that old dialogue is not regenerated or relabeled. Restart a development server after changing persistent store classes or frozen snapshot code: Next hot reload can retain the process-global SQLite store instance.

Kiro CLI implemented `hypothesis.ts` and `HypothesisBoard.tsx`, its tests and related specification/steering. The builder enumerates all three suspect identities × both event values; it receives no solution. Each player toggles a local set of excluded IDs, may undo/reset any mark, and sees a neutral personal-theory label when one remains. The board never automatically eliminates a world or judges that theory. Player notes are not shared or persisted. Codex integrated and styled the component; exact authorship and Kiro-run test output are in `kiro-usage.md`.

In the later ten-language run, Kiro authored or extended six source/test files for the secondary UI and detective guidance. Its first focused test command failed on a French string quote; after correction, the same command passed 19 tests. Kiro then wrote requirements/design before the service throttled its response stream and the process exited 1. The planned tasks record was subsequently written by Codex. This is completed implementation and focused-test evidence within a partially completed agent run, not a successful end-to-end Kiro completion. [The actual run record](kiro/ten-languages-README.md) separates those contributions from Codex's main UI, engine/server/catalogue integration and broader validation.


## 2026-11-05 group-chat revision

Current UI: `CaseChat.tsx` + `chat.css`, sequential introduction/official statements, typed questions, quote references, optional case notes, deliberate one-shot accusation. `StoryComic.tsx` now implements a single real-photo shutter entry, despite its retained filename. The historical comic atlas and hypothesis board are not current UI.

New-case logic is `conditional-alibis` v2; v1 remains valid. `Claim.fact_or_culprit` is evaluated directly by the six-world solver. Conditional evidence and proofs are authored in all ten locales. `createCase` chooses v2; `createVariant` defaults to v1 for backwards-compatible callers.

`lib/chat/routing.ts` is actual Kiro-authored pure code. `provider.server.ts` contains replaceable CLI/HTTP adapters and public-only model payloads, strict validated plans and a 20-second fallback. `copy.ts` renders authored lines and exact snapshot quotes. `/api/chat` reconstructs local drafts or fetches immutable active shared snapshots, applies origin/rate/body limits, persistent call caps and rechecks a shared case after a slow call. `budget.server.ts` retains hashes/plans only for an hour. The Kiro CLI runs with no tools/resources in an isolated work directory; its own provider/session retention is separate from the app cache. A photo is never included in chat payloads.

See [current validation](group-chat-validation.md) for executed checks, live provider evidence and limitations.
