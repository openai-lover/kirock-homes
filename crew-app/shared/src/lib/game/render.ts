import { CONDITIONAL_TEXT } from './conditional-catalog';
import { characterLines, confession, nameOf, storyContext, storyTitle } from "./content";
import { validateDraft } from "./generator";
import { validatePuzzle } from "./solver";
import { renderInterrogations } from "./interrogation";
import { EVIDENCE_TEXT, fill } from "./evidence-catalog";
import { isLocale } from "../i18n/locales";
import { SUSPECT_IDS, type CaseDraft, type CaseResolution, type Locale, type PublicSnapshot, type Statement, type SuspectId, type World } from "./types";

function requireLocale(locale: Locale): void {
  if (!isLocale(locale)) throw new Error("Unsupported language.");
}

/** Structural claims select authored templates; AI never touches this path. */
export function renderClaim(statement: Statement, draft: CaseDraft, locale: Locale): string {
  requireLocale(locale);
  const text = EVIDENCE_TEXT[locale];
  const claim = statement.claim;
  if (claim.type === "culprit_is") {
    return fill(draft.storyId === "coffee" ? text.coffeeAccusation : text.stickerAccusation,
      { target: nameOf(draft, claim.suspectId, locale) });
  }
  if (claim.type === 'fact_or_culprit') {
    const factIndex = (claim.negated ? claim.value : !claim.value) ? 1 : 0;
    const fact = draft.storyId === 'coffee' ? fill(text.coffeeFact[factIndex], {target:nameOf(draft,draft.factSubjectId!,locale)}) : text.bellFact[factIndex];
    const condition = locale === 'ko' ? fact.replace(/있었어요\.$/,'있었다면').replace(/울렸어요\.$/,'울렸다면') : fact.replace(/[.。।]$/,'').replace(/^[A-ZÀ-Ý]/, letter => letter.toLocaleLowerCase(locale));
    return fill(claim.negated ? CONDITIONAL_TEXT[locale].ifGuilty : CONDITIONAL_TEXT[locale].ifFact, {
      fact: claim.negated ? fact : condition, accusation:fill(draft.storyId === 'coffee' ? text.coffeeAccusation : text.stickerAccusation,{target:nameOf(draft,claim.suspectId,locale)})
    });
  }
  const index = claim.value ? 1 : 0;
  if (draft.storyId === "sticker") return text.bellClaim[index];
  return statement.speakerId === draft.factSubjectId
    ? text.coffeeSelf[index]
    : fill(text.coffeeOther[index], { target: nameOf(draft, draft.factSubjectId!, locale) });
}

export function explainCase(draft: CaseDraft, locale: Locale): { world: World; proofSteps: string[] } {
  requireLocale(locale);
  const checked = validateDraft(draft);
  const world = validatePuzzle(checked.statements);
  const text = EVIDENCE_TEXT[locale];
  const index = world.fact ? 1 : 0;
  const fact = checked.storyId === "coffee"
    ? fill(text.coffeeFact[index], { target: nameOf(checked, checked.factSubjectId!, locale) })
    : text.bellFact[index];
  const values = {
    first: nameOf(checked, checked.roleAssignment.a, locale),
    second: nameOf(checked, checked.roleAssignment.b, locale),
    third: nameOf(checked, checked.roleAssignment.c, locale),
    culprit: nameOf(checked, world.culpritId, locale), fact,
  };
  return { world, proofSteps: (checked.templateVersion === 2 ? CONDITIONAL_TEXT[locale].proof : text.proof).map(template => fill(template, values)) };
}

/** Allowlist DTO: no structural claims, role assignment, solution, confession, or proof. */
export function publicSnapshot(draft: CaseDraft, locale: Locale): PublicSnapshot {
  requireLocale(locale);
  const checked = validateDraft(draft);
  const lines = Object.fromEntries(checked.suspects.map((suspect) => [suspect.id, characterLines(suspect, locale)])) as Record<SuspectId, string[]>;
  const statements = checked.statements.map((statement) => ({
    id: statement.id, speakerId: statement.speakerId, text: renderClaim(statement, checked, locale),
  }));
  const text = EVIDENCE_TEXT[locale];
  const factLabels: [string, string] = checked.storyId === 'coffee'
    ? text.coffeeLabels.map(template => fill(template, { target: nameOf(checked, checked.factSubjectId!, locale) })) as [string, string]
    : [...text.bellLabels];
  return {
    locale, title: storyTitle(checked, locale), context: storyContext(checked, locale),
    suspects: checked.displayOrder.map((id) => ({ ...checked.suspects.find((suspect) => suspect.id === id)!, displayName: nameOf(checked, id, locale) })),
    statements,
    characterLines: lines,
    interrogations: renderInterrogations(checked, locale, statements),
    factLabels,
  };
}

export function resolveCase(draft: CaseDraft, accusedId: SuspectId, locale: Locale): CaseResolution {
  if (!SUSPECT_IDS.includes(accusedId)) throw new Error("Unknown accusation.");
  const { world, proofSteps } = explainCase(draft, locale);
  return {
    correct: accusedId === world.culpritId, accusedId, culpritId: world.culpritId,
    proofSteps, confession: confession(draft, world.culpritId, locale), fact: world.fact,
  };
}
