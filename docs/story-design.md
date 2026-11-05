# The biscuit prologue — 2026-11-05

Request: a Story button that explains the game through a fun comic. Preserve the quiet character-led entry and the existing detective identity.

## Plan before implementation

Palette: ink #253b3b, paper #fff8e8, teal #2c6667, brass #c79d54, biscuit #bd7441. The existing Cormorant display font supplies the chapter title; system text keeps dialogue readable in all ten languages. The artwork uses the current ghost detective's deerstalker, teal scarf and ordinary magnifying glass, with expressive cup, lamp and keyboard characters.

One large illustrated panel per page. Speech bubbles are live localized HTML immediately below the illustration, attached to a small speaker label. No text is baked into the art. A four-page prologue follows a missing biscuit, the objects' comic denials, Kirock's arrival, and an invitation to investigate a photo. This is introductory fiction, not a generated case or evidence. The actual puzzle still owns all official statements, answers and explanations.

```
                     [Story] on the home screen
 ┌──────────────────────────────────────────┐
 │ The biscuit incident               close │
 │ ┌──────────────────────────────────────┐ │
 │ │         single comic scene           │ │
 │ └──────────────────────────────────────┘ │
 │ chapter title / short narration          │
 │       speaker + comic speech bubble     │
 │ [back]            1 / 4           [next] │
 └──────────────────────────────────────────┘
```

Desktop uses an illustrated spread with dialogue in a slim adjacent column; mobile stacks art and dialogue. Only the panel changes on demand. The last page offers the sample game and the user's own photo. Escape closes; arrow keys turn pages respecting RTL; focus stays in the dialog and returns to Story on dismissal. Background is inert and scrolling is locked. Reduced motion has no page animation. Slow or broken art must retain the story text and working actions. No automatic opening of this comic.

## Critique before implementation

A tutorial carousel with icon cards would miss the user's request for an actual comic. Original scene illustrations carry the humor, while short character lines explain play. Avoid decorative evidence stamps, ornamental borders and extra homepage paragraphs: the memorable element is the talking-object story itself. Keep controls outside the art so translations do not cover faces. Limit the prologue to four pages; navigation is quiet and the final action is concrete. The story does not identify any character as the culprit, and runtime faces and mystery rules are unchanged.

This is Codex-authored presentation work and built-in image generation; no new Kiro execution or credit usage is claimed.
