# Kirock Homes — the consulting room

Design revision, 2026-10-31. Implementation and art direction: Codex.

The previous scrapbook, rounded enamel buttons and oversized mascot did not read as a Sherlock-inspired mystery. The new point of view is a visitor entering a Victorian consulting detective's study and opening a case dossier on the desk. The humorous object dialogue remains the counterpoint to the serious surroundings.

## Visual plan

- Walnut black `#151410`: room and negative space.
- Bottle green `#1d3028`: leather, active controls and dossier binding.
- Aged brass `#b79a61`: fine rules, engraved monogram and primary action.
- Bone `#ded3b8`: paper and display text.
- Oxblood `#702f30`: case seal and objection stamp, never a pre-verdict guilt signal.
- Ink `#292b25`: readable testimony on paper.

Cormorant Garamond supplies literary Latin display typography. Nanum Myeongjo supplies Korean literary headings. Native sans-serif remains for small controls and multilingual reading. Fonts are local, licensed, and do not add a runtime service.

```
K.H. agency mark                         sound / motion / language
────────────────────────────────────────────────────────────────
CONSULTING AGENCY                     study window, lamp, books
Kirock                               ┌ case dossier ───────────┐
Homes                                │ original room photo    │
Room of Suspects                     │ small object faces     │
premise / start case / upload         └ photograph caption ────┘
small detective and quotation          ink note + wax seal
────────────────────────────────────────────────────────────────
01 Awaken              02 Compare               03 Deduce
```

Investigation: a mounted photograph on the left, a leather-bound paper dossier on the right. Testimony uses numbered records, cross-examination uses indented transcripts, and objections use a restrained red ink stamp. One common material system carries through casting, awakening, deduction, verdict and sharing.

## Principles and pre-build review

1. Establish the period through architecture, typography and materials together; recolouring the old scrapbook is insufficient.
2. Preserve the user's actual photograph and its coordinate plane. No sepia filter, crop or RTL mirroring of evidence.
3. Keep Kirock as a small recognizable companion. No anatomical eyes, large creepy lens, or horror imagery.
4. Controls stay native, legible, keyboard accessible, and at least 44 px high. Decorative artwork cannot intercept input.
5. English remains the default; all ten languages, frozen shared content and reduced motion remain functional.

The plan addresses the requested Sherlock atmosphere while preserving the comedy game. Image generation is supplementary; the UI must remain readable over a plain background and while the scene image loads. Existing engine, official testimony, server adjudication and Kiro provenance are outside this visual change.
