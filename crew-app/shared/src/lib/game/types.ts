/** The engine has no DOM, network, AI, storage, or framework dependencies. */
import type { Locale } from "../i18n/locales";
export type { Locale } from "../i18n/locales";
export const SUSPECT_IDS = ["s0", "s1", "s2"] as const;
export type SuspectId = (typeof SUSPECT_IDS)[number];
export const OBJECT_KINDS = ["cup", "lamp", "electronics", "book", "plant", "toy", "other"] as const;
export type ObjectKind = (typeof OBJECT_KINDS)[number];
export const PERSONALITY_IDS = ["dry", "dramatic", "sleepy", "cheerful"] as const;
export type PersonalityId = (typeof PERSONALITY_IDS)[number];
export type StoryId = "coffee" | "sticker";

export type Claim =
  | { type: "culprit_is"; suspectId: SuspectId }
  | { type: "fact_is"; value: boolean }
  | { type: "fact_or_culprit"; value: boolean; suspectId: SuspectId; negated: boolean };
export type World = { culpritId: SuspectId; fact: boolean };
export type Statement = { id: string; speakerId: SuspectId; claim: Claim };
export type Suspect = {
  id: SuspectId;
  displayName: string;
  /** Localizable sample identity only; remove this marker when the player renames it. */
  sampleName?: "cup" | "lamp" | "keyboard";
  kind: string;
  face: { x: number; y: number; scale: number; rotation: number };
  personalityId: string;
};
export type Triple<T> = [T, T, T];
export type RoleAssignment = { a: SuspectId; b: SuspectId; c: SuspectId };
export type CaseDraft = {
  schemaVersion: 1;
  templateId: "opposed-facts" | "conditional-alibis";
  templateVersion: 1 | 2;
  storyId: StoryId;
  storyVersion: 1;
  factId: "lamp-on-at-spill" | "bell-after-midnight";
  factSubjectId?: SuspectId;
  roleAssignment: RoleAssignment;
  factInverted: boolean;
  displayOrder: Triple<SuspectId>;
  locale: Locale;
  suspects: Triple<Suspect>;
  statements: Triple<Statement>;
};
export type PublicStatement = { id: string; speakerId: SuspectId; text: string };
export type PublicSnapshot = {
  locale: Locale;
  title: string;
  context: string;
  suspects: Suspect[];
  statements: PublicStatement[];
  characterLines: Record<SuspectId, string[]>;
  /** Optional only for immutable shares created before the interrogation expansion. */
  interrogations?: import('./interrogation').Interrogations;
  /** Public event alternatives, ordered false then true; neither is marked correct. */
  factLabels?: [string, string];
};
export type CaseResolution = {
  correct: boolean;
  accusedId: SuspectId;
  culpritId: SuspectId;
  proofSteps: string[];
  confession: string;
  fact: boolean;
};
