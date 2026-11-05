# Actual Kiro group-chat development and runtime use

Date: 2026-11-05. CLI 2.37.0, V2 engine. The existing authenticated user session was verified without printing identity or credentials. Official headless/agent configuration documentation was consulted; newer V3-only features were not assumed to work with this binary.

## Development run

Kiro authored only:

- `src/lib/chat/routing.ts`
- `tests/chat-routing.test.ts` (84 focused test cases)
- `.kiro/specs/group-chat-routing/requirements.md`
- `.kiro/specs/group-chat-routing/design.md`
- `.kiro/specs/group-chat-routing/tasks.md`

The actual run began at 2026-11-05T05:18:13.001Z and ended at 05:20:44.330Z UTC, exit 0. The event stream includes file-writing events and an executed `node --import tsx --test tests/chat-routing.test.ts 2>&1` command with completed status. Kiro reported 84 passes; Codex independently reran these tests in the full suite.

Evidence: [prompt](group-chat-task-prompt.txt), [raw events](group-chat-events.jsonl), [run metadata](group-chat-run.json), [authored file hashes](group-chat-authored-hashes.json). The scoped agent configuration was prepared by Codex. Kiro's routing implementation is pure and imports no solver or private case state.

## Live runtime check

Codex implemented the runtime adapter, exact public-text allowlist, response validator integration, fallback, SQLite caps and API route. `scripts/check-live-chat.ts` called the signed-in Kiro CLI using a synthetic sample question and public statements. [Actual result](../verification/group-chat-live.json): mode `kiro`, 6,138 ms, `s0` compare / `s2` reference / dramatic / interject. No photograph or private solution was sent.

A second actual call was made through the browser: a Korean question challenged the mug against the lamp's statement. The returned UI showed a mug comparison and lamp interjection with exact evidence quotations and the Kiro interpretation label. This is not a mock-provider claim. Most automated browser tests deliberately use offline or mocked replies to avoid repeated paid requests.

Kiro selects a structured conversational action; code supplies the words. This does not claim unrestricted AI prose, tool use by game characters, autonomous evidence discovery, or a player Kiro-login integration. The server uses the developer's existing session only when explicitly configured locally. No balance, contest credit approval/redemption or charged-credit source was verified.

## Authorship

Codex authored the chat UI and photo story, pure v2 conditional template and ten-language evidence/proof catalog, runtime adapters, route, budget store, integration tests, browser tests, source packaging and documentation. Earlier Kiro contributions remain in the repository with their original provenance, but the old notebook and six-card hypothesis board are no longer the main game UI. No Kiro hook, native IDE spec workflow or Kiro browser test is claimed for this task.

Official references consulted: [headless mode](https://kiro.dev/docs/cli/headless/), [CLI commands](https://kiro.dev/docs/cli/reference/cli-commands/), [custom agent configuration](https://kiro.dev/docs/custom-agents/configuration-reference/), [ACP](https://kiro.dev/docs/cli/acp/).

During a later live browser check, an automatic recipient choice answered from the wrong object when the question began with another object's name. Codex added deterministic recognition of `Name, ...` / `@Name` before calling Kiro and validates the response against that explicit recipient. A regression test rejects wrong-speaker AI output. The final live Korean question addressed the mug and compared the lamp's statement; the mug answered first and the lamp interjected, with the Kiro interpretation label visible. This correction is Codex work; Kiro-authored file hashes remain unchanged.
