import { CONDITIONAL_TEXT } from './conditional-catalog';
import type { CaseDraft, Locale, ObjectKind, PublicStatement, Statement, SuspectId } from "./types";
import { SUSPECT_IDS } from "./types";
import { nameOf } from "./content";
import { isLocale } from "../i18n/locales";
import { fill } from "./evidence-catalog";
import { INTERROGATION_TEXT } from "./interrogation-catalog";

export const INTERROGATION_VERSION = 1 as const;

/** Authored discussion of existing evidence, never a fourth official statement. */
export type InterrogationRoute = {
  version: typeof INTERROGATION_VERSION;
  speakerId: SuspectId;
  question: string;
  challenge: string;
  rebuttalSpeakerId: SuspectId;
  rebuttal: string;
  note: string;
  citedStatementIds: [string, string];
};
export type Interrogations = Record<SuspectId, InterrogationRoute>;

/**
 * Takes a validated draft and exact renderClaim output, avoiding a renderer cycle.
 * Routes use existing claims, their fixed subject, and object kind. No private
 * roleAssignment/factInverted lookup, solver, answer, or AI-generated prose.
 */
export function renderInterrogations(
  draft: CaseDraft,
  locale: Locale,
  officialStatements: readonly PublicStatement[],
): Interrogations {
  if (!isLocale(locale)) throw new Error("Unsupported interrogation language.");
  if (officialStatements.length !== 3 || new Set(officialStatements.map(s => s.id)).size !== 3) {
    throw new Error("Interrogation needs the existing three official statements.");
  }
  const text = INTERROGATION_TEXT[locale];
  const textById = new Map(officialStatements.map(s => [s.id, s]));
  for (const statement of draft.statements) {
    const rendered = textById.get(statement.id);
    if (!rendered || rendered.speakerId !== statement.speakerId || typeof rendered.text !== "string" || !rendered.text.trim()) {
      throw new Error("Interrogation citation does not match its official witness.");
    }
  }
  const name = (id: SuspectId): string => nameOf(draft, id, locale);
  const official = (statement: Statement): string => `“${textById.get(statement.id)!.text}”`;
  const spoken = (id: SuspectId, turn: 0 | 1, body: string, statement: Statement): string => {
    const kind = draft.suspects.find(s => s.id === id)?.kind as ObjectKind;
    const cue = (text.voices[kind] ?? text.voices.other)[turn];
    return `${cue} ${body}\n${official(statement)}`;
  };
  const subject = draft.storyId === "coffee" ? name(draft.factSubjectId!) : text.bellSubject;

  return Object.fromEntries(SUSPECT_IDS.map((speakerId): [SuspectId, InterrogationRoute] => {
    const statement = draft.statements.find(s => s.speakerId === speakerId);
    if (!statement) throw new Error("Missing interrogation witness.");
    const speaker = name(speakerId);
    if (draft.templateVersion === 2) {
      const other = draft.statements[(draft.statements.indexOf(statement)+1)%3];
      const copy = CONDITIONAL_TEXT[locale];
      return [speakerId, {version:INTERROGATION_VERSION,speakerId,question:copy.question,
        challenge:spoken(speakerId,0,statement.claim.type==='fact_is'?copy.factChallenge:copy.challenge,statement),rebuttalSpeakerId:other.speakerId,
        rebuttal:spoken(other.speakerId,1,copy.rebuttal,other),note:copy.note,citedStatementIds:[statement.id,other.id]}];
    }
    if (statement.claim.type === "fact_is") {
      const ownValue = statement.claim.value;
      const opposite = draft.statements.find(s => s.claim.type === "fact_is" && s.claim.value !== ownValue);
      if (!opposite || opposite.speakerId === speakerId) throw new Error("Missing opposing official statement.");
      const values = { speaker, other: name(opposite.speakerId), subject };
      const challenge = ownValue
        ? (draft.storyId === 'coffee' ? text.trueCoffeeChallenge : text.trueBellChallenge)
        : text.falseChallenge;
      const note = ownValue
        ? (draft.storyId === 'coffee' ? text.trueCoffeeNote : text.trueBellNote)
        : (draft.storyId === 'coffee' ? text.falseCoffeeNote : text.falseBellNote);
      return [speakerId, {
        version: INTERROGATION_VERSION, speakerId,
        question: fill(ownValue ? text.trueQuestion : text.falseQuestion, values),
        challenge: spoken(speakerId, 0, fill(challenge, values), statement),
        rebuttalSpeakerId: opposite.speakerId,
        rebuttal: spoken(opposite.speakerId, 1, fill(ownValue ? text.trueRebuttal : text.falseRebuttal, values), opposite),
        note: fill(note, values), citedStatementIds: [statement.id, opposite.id],
      }];
    }
    // The named witness is public evidence already; their reply admits or denies nothing.
    const targetId = statement.claim.suspectId;
    const targetStatement = draft.statements.find(s => s.speakerId === targetId);
    if (!targetStatement || targetId === speakerId) throw new Error("Missing named witness for the rebuttal.");
    const values = { speaker, target: name(targetId) };
    return [speakerId, {
      version: INTERROGATION_VERSION, speakerId,
      question: fill(text.directQuestion, values),
      challenge: spoken(speakerId, 0, fill(text.directChallenge, values), statement),
      rebuttalSpeakerId: targetId,
      rebuttal: spoken(targetId, 1, fill(text.directRebuttal, values), targetStatement),
      note: text.directNote, citedStatementIds: [statement.id, targetStatement.id],
    }];
  })) as Interrogations;
}
