export * from "./types";
export * from "./solver";
export * from "./generator";
export * from "./render";
export { characterLines, sampleNames } from "./content";

import type { Locale, Suspect, Triple } from "./types";
import { DEFAULT_LOCALE } from "../i18n/locales";
import { sampleNames } from "./content";

export function sampleSuspects(locale: Locale = DEFAULT_LOCALE): Triple<Suspect> {
  const [cup, lamp, keyboard] = sampleNames(locale);
  return [
    { id: "s0", displayName: cup, sampleName: "cup", kind: "cup", face: { x: 0.27, y: 0.56, scale: 0.16, rotation: -5 }, personalityId: "dramatic" },
    { id: "s1", displayName: lamp, sampleName: "lamp", kind: "lamp", face: { x: 0.72, y: 0.24, scale: 0.15, rotation: 5 }, personalityId: "dry" },
    { id: "s2", displayName: keyboard, sampleName: "keyboard", kind: "electronics", face: { x: 0.61, y: 0.78, scale: 0.17, rotation: 0 }, personalityId: "sleepy" },
  ];
}
