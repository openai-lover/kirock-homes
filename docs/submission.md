# Kirock Homes: Room of Suspects

Your room. Three suspects. One liar. Turn a real photo into a comedy mystery, question your belongings in a group chat, and optionally let your own Kiro perform the cast inside Kiro Crew.

## Inspiration

A desk already has a cast of characters: a defensive laptop, theatrical headphones, a plant with suspiciously good vibes. We wanted the first moment to feel magical and funny: you photograph an ordinary room, familiar objects open their eyes, and suddenly you are in their group chat. “Kirock Homes” combines the detective reference with Kiro and the home where the mystery happens.

## What it does

Try the instant web game or upload a photograph. Wake three objects, hear the incident and three official statements one at a time, question the cast, and make one final accusation. Correct and wrong guesses both receive a complete explanation. The original photo stays intact; SVG eyes, mouths, glances and expressions bring the objects to life. A magnifying-glass opening and living-photo story introduce the idea. This is photo augmentation, not camera-tracked AR.

There are two ways to play. The public website needs no account and uses manual casting and authored interactive replies. The optional **Kiro Crew app** runs locally with the player's own Kiro account: Kiro identifies objects in a resized photo, suggests approximate face positions and personalities, and generates fresh reactions to the player's typed question and recent conversation. Another relevant object can interrupt. The player can correct faces and turn AI off at any time. The app does not purchase credits or configure payment.

The latest 96-second demo is actual Crew gameplay: successful photo recognition, a visible face correction, two live generated/reviewed replies, an adversarial request handled by scripted refusal, and a final verdict. The ending card is labelled recorded development evidence, not a live terminal capture.

## How we built it

Next.js, TypeScript, React, CSS and SVG power the web game. A pure TypeScript deduction engine enumerates exactly six worlds: three culprits times two event states. Every approved case has exactly one solution, only the culprit's official statement is false, and removing any statement leaves at least two possible culprits. Both 144-variant template families are checked across ten languages. Role shuffling preserves the fact and object being discussed.

Official testimony, guilt, confession and explanation come from code. AI cannot edit them. Generated dialogue is deliberately non-evidentiary character performance, with exact evidence inserted separately as code-owned quotations. A structural validator and a separate Kiro semantic review reject unsafe output; failures fall back to authored dialogue. Semantic review is probabilistic, not a proof: a model can infer an answer from public evidence, so we do not claim perfect semantic leak prevention.

Crew uses the same engine and photo/chat UI, an installable manifest and prebuilt bundles. Its Node backend verifies signed Crew proxy requests, binds to loopback, permits one in-flight request and caps attempts at 20 per UTC day. A generated turn makes two model calls. Runtime dialogue has no tools; photo analysis can read only its temporary JPEG. The personal Kiro login is never shipped or exposed as a public AI endpoint.

The public web deployment uses Vercel Hobby and Turso Starter. Opt-in friend links freeze the photograph, cast, evidence, authored dialogue and answer. Each friend has an independent session; the server withholds the solution until accusation, locks the first verdict, and enforces deletion and seven-day expiry. Crew play does not publish photos or create friend links.

## How we used Kiro

Kiro CLI 2.37.0 actually authored the new performance validator, 107 focused tests and three specification files, then fixed an initial failing test and passed all 107. Kiro subsequently executed 131 engine/performance/integration tests, including both deduction families. Actual prompts, redacted tool events, failures, corrections and file hashes are in `docs/kiro/live-dialogue/`; the root `.kiro` directory is included.

Earlier real Kiro work includes the hypothesis builder, detective guidance, secondary language UI, decorative SVG props and chat-routing validator/fallback with 84 focused tests. Those runs have their own attribution and failure records. Codex created the original game, solver, sharing server, assets and UI, then integrated the live runtime and packaged the Crew app. Codex work is not attributed to Kiro. No unused Kiro hook or IDE workflow is claimed.

## Challenges and what we learned

The hardest problem was allowing spontaneous comedy without allowing spontaneous evidence. We separated the fixed logical case from character performance, kept quoted statements exact, removed the private solution from model inputs, and added a second review. Early generated responses failed validation or were over-rejected; we retained those failed runs and narrowed the prompts. A five-question real runtime check then produced five accepted turns, while the actual Crew UI demo also demonstrates a safe fallback.

Integration checks caught an incorrect Crew bundle path, a proxy prefix mismatch, a photo timeout too short for Kiro, and a consent assumption in an older test. All were corrected before the final verification. A generated Kiro review overstated its test scope; we kept that initial report and accepted only the later actual execution output as evidence.

## Accomplishments

The delivered main project passes 284 unit/server/solver tests, type checking, a production build, and 63 Chromium browser tests. Crew has additional backend authentication/budget checks and real photo/dialogue evidence. English is the default; ten languages, Arabic RTL, keyboard input, captions, mute and reduced motion are supported. Licensed alternate photos exercise landscape/portrait and correct/wrong verdict paths.

These checks are not a user study or a recognition benchmark. Physical iPhone/Android testing and native-speaker review of every translation have not been performed. AI face positions can need correction. Free hosting and Kiro quotas remain external limits.

## What's next

Observe consenting players to refine the timing, comedy and difficulty; expand the bank of code-verified case templates; and improve approximate object placement while retaining manual control. The public game remains accessible without an account, while interested players can install the optional Crew edition.

## Links

- Play: https://kirock-homes.vercel.app
- Main source: https://github.com/openai-lover/kirock-homes
- Crew app source (same GitHub owner): https://github.com/openai-lover/kirock-homes-crew
- Demo: https://youtu.be/7gknqGSknDk
- Install: https://kirock-homes.vercel.app/crew

The detective mascot is an independent, unofficial Kiro-inspired adaptation. Photograph/font/image licenses and authorship are documented in `docs/assets.md`. No official endorsement or award is claimed.
