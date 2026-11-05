# Kirock Homes for Kiro Crew

**Your room. Three suspects. One liar.** A real photograph becomes a comedy group-chat mystery inside Kiro Crew.

[Play the instant web edition](https://kirock-homes.vercel.app) · [Main project](https://github.com/openai-lover/kirock-homes) · [Actual Crew demo](https://youtu.be/7gknqGSknDk)

## Install

Requires **Node.js 24**, **Kiro Crew 0.11.2+**, and **Kiro CLI 2.37.0** signed in to your own account. Install Crew/CLI from [Kiro's official documentation](https://kiro.dev/docs/crew/). Keep the gateway on localhost. The game never asks for a password, API key, card, or subscription purchase.

```sh
git clone https://github.com/openai-lover/kirock-homes-crew.git
kirocrew app install ./kirock-homes-crew
kirocrew app enable kirock-homes
```

If Crew blocks third-party app execution, review this source and trust **only `kirock-homes`** in Crew Settings. Do not enable every third-party app. Then open **Kirock Homes** in the Crew sidebar (route `/apps/kirock-homes`). Prebuilt bundles are included: no npm install is needed to play. Start Crew with Node 24 and `kiro-cli` on PATH.

Custom CLI/session paths are optional. Put only path strings in `KIROCREW_HOME/app-data/kirock-homes/runtime.json` (default Crew home is `~/.kiro/crew`). Never copy another person's session:

```json
{"cliPath":"/absolute/path/to/kiro-cli","kiroHome":"/absolute/path/to/your/kiro-home"}
```

## Play

Upload JPG/PNG/WebP, open **Get object suggestions**, consent, and ask Kiro to identify three objects. Suggestions are approximate; move/size the faces before waking them. Manual selection also works. Advance through the case and three official statements. Enable Kiro dialogue in chat, then ask a question such as “Laptop, why are you so defensive?” Another object can interrupt. Make one accusation and read the explanation.

Kiro consumes your existing allowance: one vision call; two model calls per generated chat turn (performance + independent review). The backend caps attempts at 20 per UTC day, permits one in-flight request, and caches identical responses for one hour. This cap is **not a monetary or credit guarantee**. This app does not purchase credits or enable overages. Keep any account overage settings under your own control. If Kiro is unavailable, late, malformed or rejected, manual casting and scripted replies still complete the game.

Official testimony, culprit, confession and explanation are fixed by the shared TypeScript engine. Each approved case enumerates all six worlds and requires exactly one solution; removing any statement leaves at least two possible culprits. Generated lines are non-evidentiary performance. Structural validation and separate AI review reduce semantic mistakes, but review is probabilistic and cannot guarantee every sentence. Public evidence is quoted verbatim. No private solution is sent to the model, though a capable model could infer it from public clues; the review is designed to reject such output.

## Privacy and permissions

The local backend accepts signed Crew proxy requests only. It binds to loopback. Each Kiro turn gets an isolated working directory and explicit capability rules: no tools for dialogue; photo analysis can read only its temporary resized JPEG. No shell, browsing, MCP or delegation is allowed for runtime turns. The child environment excludes Crew credentials and provider keys. Kiro authentication remains with the official CLI.

Photos stay in the browser until you request analysis. A temporary JPEG is deleted after each vision request. The backend stores daily counts, request hashes and bounded responses for one hour in `allowance.sqlite`; it does not store source photos or raw questions. Responses can refer to chat. Kiro itself may retain prompts, photo attachments and session history according to its service/local retention policies. Do not use sensitive images. This edition does not publish photos or offer friend links. Use the separate web edition for opt-in sharing.

## Build and test

```sh
npm ci
npm run build
npm test
```

The lockfile pins build dependencies. The running backend uses Node built-ins; React is bundled into the isolated game iframe and the thin outer entry uses Crew's React runtime. `shared/src/` comes from the main project (`npm run build:crew` there); it is not a second deduction engine. Backend tests exercise HMAC authentication, stale/tampered requests, consent, fallback, concurrency, duplicate caching and daily limits without using real credits.

The main repository contains exhaustive solver, UI, real Kiro call and browser evidence. Kiro authored `shared/src/lib/chat/performance.ts`, 107 focused tests (in the main repo) and associated specs; Codex authored runtime integration, Crew packaging and broader verification. Earlier Kiro contributions remain individually documented in the main project. This is an unofficial independent app, not an official Kiro character release or endorsement.
