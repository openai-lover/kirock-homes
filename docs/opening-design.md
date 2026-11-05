# A visit to Kirock's study

2026-10-31. User request: the page feels busy; first show an immersive Sherlock-like full-screen scene, let Kirock glide in, then reveal the homepage.

## Plan before implementation

Retain walnut black `#151410`, bottle green `#1d3028`, aged brass `#b79a61`, bone `#ded3b8`, and ink `#292b25`. Cormorant and Nanum Myeongjo remain the display voices; controls use a readable system sans-serif. Reuse the existing generated study and detective cutout rather than introducing another competing visual style.

```
0.0 s   [ entire Victorian study, one discreet Skip button ]
0.6 s   [ Kirock glides in from the right, then settles ]
1.5 s   [ Kirock Homes + one spoken-as-caption line ]
5.2 s   [ dissolve to a quiet homepage ]

Home:   title / premise / two actions        one scene photograph
        watch opening                      no seals or sticky notes
```

Left-aligned opening title and a large character on the right on desktop; title above character on mobile. No browser fullscreen permission, sound autoplay, flashing lights, or new mystery evidence. The opening occupies the browser viewport, not the operating-system screen.

## Review against the request

The memorable element is now one coordinated character entrance. Remove the home page's extra agency eyebrow, mascot quotation, wax seal/note, folded-folder layer and paperclip. Keep the original photograph and core game actions. Reduce the background on the homepage so it does not compete with the foreground; the full scene belongs to the opening.

First-visit playback is stored only in local browser storage. Returning visits and direct shared-case links bypass the opening. A small replay action is available from home. Reduced-motion users go directly home automatically and can request a static opening. Keyboard dismissal, focus return, bounded loading, blocked storage and background inertness must be verified. Existing gameplay and server adjudication remain unchanged.

Authorship: this sequence and home simplification are Codex work. Existing Kiro contributions and art provenance are preserved.
