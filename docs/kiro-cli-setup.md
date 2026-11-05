# Kiro CLI preparation, 2026-10-31

This records actual environment preparation by Codex. Preparation alone is not evidence that Kiro developed or reviewed the game. The later authenticated Kiro implementation is documented separately in `docs/kiro/` and `docs/kiro-usage.md`.

## Verified environment and package

- Host: macOS 26.6.2, Apple Silicon (`Darwin arm64`).
- No `kiro` or `kiro-cli` was in PATH. Neither Kiro.app nor Kiro CLI.app was found in the checked `/Applications` and user Applications paths.
- Official [CLI guide](https://kiro.dev/docs/cli/) and [downloads](https://kiro.dev/downloads/) advertise `https://cli.kiro.dev/install`. The downloaded installer was read, not executed. Its macOS branch installs an application in `/Applications` and launches it; it does not expose a custom prefix argument.
- The official [stable manifest](https://prod.download.cli.kiro.dev/stable/latest/manifest.json) also supplies a standalone universal macOS archive. Its package README says user installation needs no root access. We used its unpacked binary in a temporary directory, leaving global applications, PATH and shell configuration unchanged.
- Version: `2.37.0`; build hash `f8a05a5cdb022eafd654bf54074e1561f6b7bb4b`.
- [Official standalone ZIP](https://prod.download.cli.kiro.dev/stable/2.37.0/kirocli-universal-darwin.zip), 262,537,234 bytes.
- SHA-256 from manifest and downloaded archive matched: `b5e33ba3d2e12dd57a43327354629a962a1013963356f79e65cea3692993b815`.
- Executable: `/private/tmp/room-of-suspects-kiro-runtime/kirocli/bin/kiro-cli`.
- `kiro-cli --version` printed `kiro-cli 2.37.0` and `kiro-cli login --help` completed.
- The first sandboxed `codesign --verify` reported an invalid signature. Repeating verification outside the sandbox returned `valid on disk` and `satisfies its Designated Requirement`. `spctl` described the code as valid but rejected its application assessment because it is not an app. No signature or OS protection was modified or bypassed.

## Authentication boundary

The current official [authentication documentation](https://kiro.dev/docs/getting-started/authentication/) supports browser authentication with GitHub, Google, AWS Builder ID or an organization. A standalone download does not require a personal account; model-backed development requires credentials. API-key creation is documented for Pro, Pro+, Pro Max and Power accounts, and the [headless guide](https://kiro.dev/docs/cli/headless/) uses `KIRO_API_KEY`. No credentials were requested in chat or added to project files.

The following real login command was started to open the official auth portal for the user to complete:

```sh
KIRO_HOME=/private/tmp/room-of-suspects-kiro-state \
  /private/tmp/room-of-suspects-kiro-runtime/kirocli/bin/kiro-cli login
```

The user completed the browser login. A subsequent `whoami` check exited 0 and confirmed authentication; identity details were not recorded. Codex did not select an account, submit credentials, authorize the login, or purchase anything. The isolated temporary state is outside the source archive. For another shell, retain the same `KIRO_HOME` when invoking this prepared binary. If the browser flow expires, rerun login; `login --use-device-flow` is available according to the inspected CLI help and [command reference](https://kiro.dev/docs/reference/cli-commands/).

## Contest requirements checked

The live [Kiroween 2026 official rules](https://kiroween.devpost.com/rules) were read on 2026-10-31. They allow Kiro IDE, CLI, Web or Crew, require substantive Kiro use and a write-up, and require the root `.kiro` directory to be included in the public GitHub repository. A copied configuration folder or a version command alone is not development evidence. The submission period starts October 30, 2026 and ends December 4, 2026 at 2 PM Pacific. This record does not claim contest eligibility or compliance.

After authentication, the user authorized a real Kiro implementation of the manual hypothesis board. It begins with reading the current engine and interrogation component, then owns only the new pure module, React component, test and related specification/steering files. The prompt, scoped agent configuration, source hashes and live output are in `docs/kiro/`. Existing Codex work remains attributed to Codex. Completion and test outcomes belong in that run's final evidence rather than being assumed here.
