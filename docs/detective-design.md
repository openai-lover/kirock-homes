# Kirock's first case

2026-10-31. The user wants a recognizably Sherlock-like detective game, with character and humor, without the crowded Victorian room. The previous plain-paper treatment removed too much of the game's personality.

## Plan and critique before implementation

The hero is a detective handing over a case, not a literary product listing. Use the large, recognizable deerstalker/cape/magnifier ghost, a single cream case folder containing the actual photograph, and three interactive suspect tabs. Selecting a suspect wakes its face and gives a brief authored joke; it must not create a mystery, count testimony, select a culprit or touch a shared case.

Palette: petrol work surface `#143139`, deep shadow `#0d252c`, case paper `#f4eedf`, amber action `#e5b65c`, ink `#233138`, objection red `#a5413c`. No furnished-room bitmap or repeated metal/leather/ornamental frames. Existing Cormorant and Nanum Myeongjo supply Sherlock's literary voice; readable sans-serif handles controls and evidence.

```
           agency mark                                   settings
           Kirock Homes          detective offering      case folder
           premise + actions     the mystery             real photo
                                                        three suspect tabs
                                                        one comic response

Case:      actual case title + investigation progress
           scene photograph     case notebook with visible evidence status
                                statements / confrontations / deduction
```

The strongest visual gesture belongs to Kirock and the case folder. Do not bring back furniture, string boards, decorative objects or a wall of seals. Mobile puts the detective beside the title and keeps actions before the larger photo preview. Gameplay keeps the readable paper panel but makes progress and suspect selection feel like an investigation. Color and expression are never derived from the culprit before a verdict.

The new case-offering pose is a Codex image-generation asset. The preview is UI-only flavor with ten static translations. Shared cases keep their own frozen content and skip the sample preview interaction. Existing Kiro provenance, official statements, six-world engine and server adjudication remain unchanged.
