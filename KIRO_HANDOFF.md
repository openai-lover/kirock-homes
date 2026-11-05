> Current 2026-11-05 group-chat revision: [actual Kiro routing contribution and runtime connection](docs/kiro/group-chat-README.md), [latest validation](docs/group-chat-validation.md). Codex integrated the live chat and photo-first story; earlier notebook/comic descriptions below are historical. Contest-credit approval remains unverified.

# Kiro handoff — completed contribution and remaining work

Updated 2026-11-04 (Asia/Seoul). **Actual Kiro CLI development has now occurred.** After the user authenticated, Kiro CLI 2.37.0 wrote the manual six-world hypothesis builder, React board, tests, and related spec/steering. It ran hypothesis and engine regression tests. In a later task it also wrote the six-stage bilingual detective guidance module, `DetectiveAside` React component and three `.kiro/specs/kirock-voice/` files, then executed the project type checker successfully. See [actual evidence](docs/kiro-usage.md) and [the newer notebook record](docs/kiro/kirock-README.md). Codex authored the earlier game and owns app/visual integration and browser/build verification. No hook execution, Kiro browser run, or IDE-native workflow is claimed.

The [earlier ten-language run](docs/kiro/ten-languages-README.md) authored or extended six source/test files for the secondary UI and detective guidance. Its first focused test failed on a French string quote; after correction the same command passed 19 tests. Kiro then wrote requirements/design, but service throttling ended the process with exit code 1 before its final report or tasks checklist. Codex wrote the observed tasks record and completed integration. This is evidence of completed implementation and focused tests within a partial agent run. The [ten-language validation](docs/ten-languages-validation.md) records that revision; prior bilingual results do not validate that expansion.

On 2026-11-04, the authenticated CLI authored seven decorative SVG prop variants and three accompanying specs. Its first typecheck failed on a JSX namespace error, which Kiro repaired before the next command passed; the run completed with exit code 0. Codex reviewed a comment/type cast and integrated the component into the attraction UI. [Recorded task](docs/kiro/attraction-run.json), [current validation](docs/story-validation.md). The generated scene/material art and broader UI are Codex work. No Kiro player-login feature or competition-credit redemption is implied.

The packages below are optional further work, not claims of already completed Kiro tasks. The initial environment check is retained as history.

## Initial availability check — before CLI setup

The supplied archive contained the plan and start prompts, not a Kiro session history or completed application. The working project did not contain an existing `.kiro` directory when first checked. `command -v kiro` and `command -v kiro-cli` returned no executable. No executable/application was found at `/Applications/Kiro.app`, `~/Applications/Kiro.app`, `~/.local/bin/kiro`, `~/.local/bin/kiro-cli`, `/opt/homebrew/bin/kiro`, or `/opt/homebrew/bin/kiro-cli`. These were scoped initial checks, not a claim that every disk location was searched. Later, official CLI 2.37.0 was verified and prepared in a temporary directory; the user completed browser authentication. See `docs/kiro-cli-setup.md` for the actual preparation, signature verification and authentication boundary.

The user asked implementation to continue independently when Kiro could not run, so the original runnable game and validation were produced in Codex. The later Kiro contributions are limited to the recorded hypothesis-board, notebook-guidance, ten-language secondary UI and decorative prop work. Merely copying files into `.kiro` would not establish meaningful Kiro development. Competition compliance is not guaranteed by this handoff or by the existence of the new files.

## Start a real Kiro session

Install/sign in through the [official installation guide](https://kiro.dev/docs/getting-started/installation/) if necessary. Record the installed version and date. Open this project with Kiro's **File → Open Folder**, or launch `kiro-cli` from this directory after the CLI has been installed. Consult `/guide` for the installed CLI's matching instructions. The [official first-project guide](https://kiro.dev/docs/getting-started/first-project/) and [CLI setup guide](https://kiro.dev/docs/cli/setup/) were checked on 2026-10-31.

Provide the following prompt in Kiro:

> Read reference/KIROWEEN_2026_PLAN.md, this KIRO_HANDOFF.md, README.md, docs/themepark-validation.md, docs/validation-results.md, and the actual source. Read `docs/kiro-usage.md` for current file-level Codex/Kiro attribution; do not relabel inherited work. Inspect existing behavior before editing. In a real spec workflow, identify an unmet acceptance criterion or concrete defect in the core reasoning engine or awakening experience, make a substantive implementation change, and verify it. Preserve the one-liar rule, the six-world exhaustive solver, unique world, necessity of each statement, fixed fact subject under role permutation, and code-owned official text. Record only actions you actually take, including failures and commands not run. Do not invent defects solely to claim improvement. If no defect is found, report the scope and limits of the review and agree a useful enhancement before claiming implementation.

## Concrete work packages

### 1. Case engine audit and a substantive verified change

Use Kiro's Specs workflow to create or refine `case-engine` with `requirements.md`, `design.md`, and `tasks.md`. The [official spec documentation](https://kiro.dev/docs/specs/) describes this structure and task execution. Mark the initial source as inherited Codex implementation.

Ask Kiro to independently enumerate every approved role permutation, state inversion, and display order for both story variants. Require one solution world among exactly six worlds and at least two distinct culprit candidates after removing each statement. Trace explanations in all ten supported languages to the same solved world. Verify the named fact subject remains fixed when the speaking role changes. Check that older shared cases preserve their stored original wording when a requested translation is unavailable. Review malformed runtime input handling, not just TypeScript types.

If Kiro finds a defect, have it write a minimal failing regression, fix the implementation, rerun the relevant suite, and retain the before/after evidence. If no defect is found, a possible substantive enhancement is an accessible **post-verdict possibility table** showing the six evaluated worlds and why each failed; implement it only after agreeing the UX and ensuring it appears solely after the verdict. It must derive from the solver rather than duplicated explanatory prose.

Completion evidence: actual Kiro requirements/design/tasks, source diff, executed test output, and a reviewed explanation for at least one role-swapped case.

### 2. Awakening and photo placement

Create/refine `awakening-scene` and `photo-casting` specs from the implemented code. Have Kiro inspect desktop and 360 px/390 px mobile flows. Measure the first visible eye movement from casting confirmation; do not describe the one-second target as measured unless recorded. Compare the same pre-verdict animation sequence with different culprits to confirm expressions do not signal guilt.

Use synthetic image fixtures for landscape, portrait, EXIF rotation, and large dimensions. Exercise manual repositioning, resizing, image-boundary clamping, and viewport changes. Check reduced motion, focus order, keyboard-only investigation and verdict submission, and that the photo stays recognizable. Ask Kiro to fix a demonstrated placement or interaction defect and preserve screenshot/test evidence.

Completion evidence: before/after visuals for a real fix, fixture dimensions and orientation, browser/device details, and actual timing if measured.

### 3. Share-case review and deployment behavior

Create/refine `share-case` around the current storage adapter. Have Kiro verify public HTML, API JSON, metadata, and image responses before a verdict contain no private solution, confession, proof, or internal role mapping. Inspect author-only deletion, independent play cookies, concurrent duplicate accusations, language-independent identity, photo disclosure confirmation, expiration, and cleanup. Preserve the same snapshot across every friend visit.

The local SQLite adapter is intended for a persistent Node host. A production remote database/private object-storage adapter and scheduled cleanup configuration require actual hosting choices and credentials. If implementing one in Kiro, use current provider documentation, keep secrets outside the repository, and test deletion and expired access against the deployed service before claiming production readiness.

Completion evidence: a real implementation diff where necessary, public-response inspection, concurrent request results, and deletion/expiry results from the selected runtime.

### 4. Run a real hook

Ask the installed Kiro to create a hook for changes to `src/lib/game/**` and the related logic tests that runs the relevant test command from `package.json`; also run the type checker on task completion. Current [official hooks documentation](https://kiro.dev/docs/hooks/) describes standalone `.kiro/hooks/*.json` files for IDE 1.0/CLI V3, event triggers, and command actions. Let the installed version generate the correct configuration; do not assume older formats match.

Trigger the hook through a genuine code change in Kiro and retain its actual output. A manually run command is not hook evidence. If demonstrating a deliberately invalid logic template, label it as a seeded test example and restore a passing tree afterward. Use [steering](https://kiro.dev/docs/steering/) to capture immutable gameplay and privacy constraints, and record who created the files.

## Evidence to retain

For each real Kiro work package, add a row to `docs/kiro-usage.md` with date, installed version/surface, problem, actual Kiro feature, changed files, exact command and exit status, commit identifier when available, and screenshot/log location. Redact credentials and private photographs before publishing evidence. Include limitations and failed checks. Do not fabricate a commit, a successful test, a screenshot, time savings, a user study, or contest eligibility.

Only after this work is performed should submission materials say Kiro implemented or verified the named functionality. Use the actual contribution and its recorded limits; do not expand it into claims about unperformed hooks, IDE features, or browser checks.

---

한국어: 이 문서는 Codex가 처음 준비한 **Kiro 인수인계**입니다. 이후 실제 Kiro CLI에서 수동 가설판·관련 명세·테스트와 여섯 단계의 한영 탐정 안내·컴포넌트·명세를 구현했습니다. 이전 작업에서는 10개 언어 보조 UI의 소스/테스트 6개 파일과 요구사항·설계를 작성했고, 수정 후 집중 테스트 19개를 통과했습니다. 이후 서비스 제한으로 종료 코드 1이 발생해 작업 목록은 Codex가 기록했습니다. 2026-11-04 새 소품 컴포넌트·명세 작업은 타입 오류를 수정하고 검사 통과 후 종료 코드 0으로 완료했습니다. 각 실행의 실제 증빙은 `docs/kiro/`에 있습니다. 위의 추가 작업들은 별도로 수행하고 검증한 뒤에만 완료 또는 Kiro 기여로 설명하세요.
