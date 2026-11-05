import type { CaseDraft, Locale, ObjectKind, PersonalityId, Suspect, SuspectId, Triple } from "./types";
import { CONTENT_CATALOG } from "./content-catalog";

/** Authored, versioned banter. It contains no alibis, suspects, or event-state assertions. */
export function characterLines(suspect: Suspect, locale: Locale): string[] {
  const copy = CONTENT_CATALOG[locale];
  return [copy.openings[suspect.kind as ObjectKind], copy.personalities[suspect.personalityId as PersonalityId]];
}

export function storyTitle(draft: CaseDraft, locale: Locale): string {
  return CONTENT_CATALOG[locale].titles[draft.storyId];
}

export function storyContext(draft: CaseDraft, locale: Locale): string {
  const copy = CONTENT_CATALOG[locale];
  return draft.storyId === "coffee"
    ? copy.coffeeContext(nameOf(draft, draft.factSubjectId!, locale))
    : copy.stickerContext;
}

export function nameOf(draft: CaseDraft, id: SuspectId, locale?: Locale): string {
  const suspect = draft.suspects.find((item) => item.id === id);
  if (!suspect) throw new Error("Unknown suspect.");
  if (locale && suspect.sampleName) {
    const index = { cup: 0, lamp: 1, keyboard: 2 }[suspect.sampleName];
    return sampleNames(locale)[index];
  }
  return suspect.displayName;
}

/** Only rendered after a server or local engine verdict. */
export function confession(draft: CaseDraft, culpritId: SuspectId, locale: Locale): string {
  const culprit = draft.suspects.find((suspect) => suspect.id === culpritId)!;
  const copy = CONTENT_CATALOG[locale].confessions;
  if (draft.storyId === "sticker") return copy.sticker;
  return culprit.kind === "cup" ? copy.cup : copy.coffee;
}

export function sampleNames(locale: Locale): Triple<string> {
  return [...CONTENT_CATALOG[locale].sampleNames];
}
