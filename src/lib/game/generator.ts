import {
  OBJECT_KINDS, PERSONALITY_IDS, SUSPECT_IDS,
  type CaseDraft, type Locale, type RoleAssignment, type Statement, type StoryId,
  type Suspect, type SuspectId, type Triple,
} from "./types";
import { validatePuzzle } from "./solver";
import { DEFAULT_LOCALE, isLocale } from "../i18n/locales";

const TEMPLATE = "opposed-facts" as const;

function record(input: unknown, label: string): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) throw new Error(`Invalid ${label}.`);
  return input as Record<string, unknown>;
}
function keys(input: Record<string, unknown>, expected: string[], label: string): void {
  if (Object.keys(input).some((key) => !expected.includes(key)) || expected.some((key) => !(key in input))) {
    throw new Error(`Unexpected or missing fields in ${label}.`);
  }
}
function isId(input: unknown): input is SuspectId { return SUSPECT_IDS.includes(input as SuspectId); }
function permutation(input: unknown, label: string): Triple<SuspectId> {
  if (!Array.isArray(input) || input.length !== 3 || !input.every(isId) || new Set(input).size !== 3) {
    throw new Error(`Invalid ${label}.`);
  }
  return [...input] as Triple<SuspectId>;
}
function finiteRange(input: unknown, min: number, max: number, label: string): number {
  if (typeof input !== "number" || !Number.isFinite(input) || input < min || input > max) {
    throw new Error(`Invalid ${label}.`);
  }
  return input;
}
export function validateSuspects(input: unknown): Triple<Suspect> {
  if (!Array.isArray(input) || input.length !== 3) throw new Error("Choose exactly three objects.");
  const suspects = input.map((raw): Suspect => {
    const suspect = record(raw, "suspect");
    const fields = ["id", "displayName", "kind", "face", "personalityId"];
    if ("sampleName" in suspect) fields.push("sampleName");
    keys(suspect, fields, "suspect");
    if ("sampleName" in suspect && !["cup", "lamp", "keyboard"].includes(suspect.sampleName as string)) throw new Error("Unknown sample name.");
    if (!isId(suspect.id)) throw new Error("Invalid suspect ID.");
    if (typeof suspect.displayName !== "string" || suspect.displayName.trim().length < 1 || suspect.displayName.length > 32 || /[\u0000-\u001f\u007f]/u.test(suspect.displayName)) {
      throw new Error("Object names must contain 1–32 readable characters.");
    }
    if (!OBJECT_KINDS.includes(suspect.kind as (typeof OBJECT_KINDS)[number])) throw new Error("Unknown object kind.");
    if ("sampleName" in suspect && suspect.kind !== ({ cup: "cup", lamp: "lamp", keyboard: "electronics" } as Record<string, string>)[suspect.sampleName as string]) {
      throw new Error("Sample name does not match the object kind.");
    }
    if (!PERSONALITY_IDS.includes(suspect.personalityId as (typeof PERSONALITY_IDS)[number])) throw new Error("Unknown personality.");
    const face = record(suspect.face, "face");
    keys(face, ["x", "y", "scale", "rotation"], "face");
    return {
      id: suspect.id, displayName: suspect.displayName, kind: suspect.kind as string,
      ...("sampleName" in suspect ? { sampleName: suspect.sampleName as Suspect["sampleName"] } : {}),
      face: {
        x: finiteRange(face.x, 0, 1, "face x"), y: finiteRange(face.y, 0, 1, "face y"),
        scale: finiteRange(face.scale, 0.08, 0.3, "face scale"),
        rotation: finiteRange(face.rotation, -180, 180, "face rotation"),
      },
      personalityId: suspect.personalityId as string,
    };
  }) as Triple<Suspect>;
  permutation(suspects.map((suspect) => suspect.id), "suspect IDs");
  const sampleMarkers = suspects.flatMap(suspect => suspect.sampleName ? [suspect.sampleName] : []);
  if (new Set(sampleMarkers).size !== sampleMarkers.length) throw new Error("Sample names must be distinct.");
  if (new Set(suspects.map((suspect) => suspect.displayName.trim().normalize("NFKC").toLocaleLowerCase())).size !== 3) {
    throw new Error("Give each object a distinct name.");
  }
  return suspects;
}

export type VariantOptions = {
  templateVersion?: 1 | 2;
  storyId: StoryId;
  roleAssignment: RoleAssignment;
  factInverted: boolean;
  displayOrder: Triple<SuspectId>;
  factSubjectId?: SuspectId;
  locale?: Locale;
};

/** Fixed story subjects do not depend on a/b/c roles or display order. */
export function createVariant(inputSuspects: Suspect[], options: VariantOptions): CaseDraft {
  const suspects = validateSuspects(inputSuspects);
  const { a, b, c } = options.roleAssignment;
  permutation([a, b, c], "role assignment");
  const displayOrder = permutation(options.displayOrder, "display order");
  if (options.storyId !== "coffee" && options.storyId !== "sticker") throw new Error("Unknown story.");
  if (typeof options.factInverted !== "boolean") throw new Error("Invalid fact inversion.");
  if (options.locale !== undefined && !isLocale(options.locale)) throw new Error("Invalid locale.");
  let factSubjectId: SuspectId | undefined;
  if (options.storyId === "coffee") {
    factSubjectId = options.factSubjectId ?? suspects.find((suspect) => suspect.kind === "lamp")?.id;
    if (!factSubjectId || !suspects.some((suspect) => suspect.id === factSubjectId && suspect.kind === "lamp")) {
      throw new Error("The coffee story needs a selected lamp as its fixed fact subject.");
    }
  } else if (options.factSubjectId !== undefined) {
    throw new Error("The fictional bell has no object subject.");
  }
  const version = options.templateVersion ?? 1;
  if (version !== 1 && version !== 2) throw new Error("Unsupported template version.");
  const bySpeaker: Record<SuspectId, Statement> = version === 2 ? {
    [a]: { id: `testimony-${a}`, speakerId: a, claim: { type: "fact_is", value: options.factInverted } },
    [b]: { id: `testimony-${b}`, speakerId: b, claim: { type: "fact_or_culprit", value: options.factInverted, suspectId: a, negated: false } },
    [c]: { id: `testimony-${c}`, speakerId: c, claim: { type: "fact_or_culprit", value: options.factInverted, suspectId: c, negated: true } },
  } as Record<SuspectId, Statement> : {
    [a]: { id: `testimony-${a}`, speakerId: a, claim: { type: "fact_is", value: !options.factInverted } },
    [b]: { id: `testimony-${b}`, speakerId: b, claim: { type: "fact_is", value: options.factInverted } },
    [c]: { id: `testimony-${c}`, speakerId: c, claim: { type: "culprit_is", suspectId: a } },
  } as Record<SuspectId, Statement>;
  const statements = displayOrder.map((id) => bySpeaker[id]) as Triple<Statement>;
  validatePuzzle(statements);
  return {
    schemaVersion: 1, templateId: version === 2 ? "conditional-alibis" : TEMPLATE, templateVersion: version,
    storyId: options.storyId, storyVersion: 1,
    factId: options.storyId === "coffee" ? "lamp-on-at-spill" : "bell-after-midnight",
    ...(factSubjectId === undefined ? {} : { factSubjectId }),
    roleAssignment: { a, b, c }, factInverted: options.factInverted,
    displayOrder, locale: options.locale ?? DEFAULT_LOCALE, suspects, statements,
  };
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(random: () => number): Triple<SuspectId> {
  const values = [...SUSPECT_IDS];
  for (let index = values.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values as Triple<SuspectId>;
}
export function createCase(suspects: Suspect[], options: { storyId?: StoryId; seed?: number } = {}): CaseDraft {
  const checked = validateSuspects(suspects);
  const random = options.seed === undefined ? Math.random : seededRandom(finiteRange(options.seed, 0, 0xffffffff, "seed"));
  const [a, b, c] = shuffled(random);
  return createVariant(checked, {
    templateVersion: 2,
    storyId: options.storyId ?? (checked.some((suspect) => suspect.kind === "lamp") ? "coffee" : "sticker"),
    roleAssignment: { a, b, c }, factInverted: random() < 0.5, displayOrder: shuffled(random),
  });
}

/** Untrusted share drafts are rebuilt from approved versions, never trusted as prose or answers. */
export function validateDraft(input: unknown): CaseDraft {
  const draft = record(input, "case");
  const allowed = ["schemaVersion", "templateId", "templateVersion", "storyId", "storyVersion", "factId", "roleAssignment", "factInverted", "displayOrder", "locale", "suspects", "statements"];
  if (draft.storyId === "coffee") allowed.push("factSubjectId");
  keys(draft, allowed, "case");
  if (draft.schemaVersion !== 1 || !((draft.templateId === TEMPLATE && draft.templateVersion === 1) || (draft.templateId === "conditional-alibis" && draft.templateVersion === 2)) || draft.storyVersion !== 1) {
    throw new Error("Unsupported case version. Start a new case.");
  }
  if (draft.storyId !== "coffee" && draft.storyId !== "sticker") throw new Error("Unsupported story.");
  if (!isLocale(draft.locale)) throw new Error("Unsupported language.");
  if (typeof draft.factInverted !== "boolean") throw new Error("Invalid fact inversion.");
  const roles = record(draft.roleAssignment, "roles");
  keys(roles, ["a", "b", "c"], "roles");
  const [a, b, c] = permutation([roles.a, roles.b, roles.c], "roles");
  if (draft.storyId === "coffee" && !isId(draft.factSubjectId)) throw new Error("Invalid fact subject.");
  const canonical = createVariant(validateSuspects(draft.suspects), {
    templateVersion: draft.templateVersion as 1 | 2,
    storyId: draft.storyId, roleAssignment: { a, b, c }, factInverted: draft.factInverted,
    displayOrder: permutation(draft.displayOrder, "display order"), locale: draft.locale,
    ...(draft.storyId === "coffee" ? { factSubjectId: draft.factSubjectId as SuspectId } : {}),
  });
  if (draft.factId !== canonical.factId) throw new Error("Unapproved event fact.");
  if (!Array.isArray(draft.statements) || draft.statements.length !== 3) throw new Error("Invalid statements.");
  draft.statements.forEach((raw, index) => {
    const statement = record(raw, "statement");
    keys(statement, ["id", "speakerId", "claim"], "statement");
    const expected = canonical.statements[index];
    if (statement.id !== expected.id || statement.speakerId !== expected.speakerId) throw new Error("Statement identity mismatch.");
    const claim = record(statement.claim, "claim");
    if (expected.claim.type === "fact_is") {
      keys(claim, ["type", "value"], "fact claim");
      if (claim.type !== "fact_is" || claim.value !== expected.claim.value) throw new Error("Official statement mismatch.");
    } else if (expected.claim.type === "fact_or_culprit") {
      keys(claim, ["type", "value", "suspectId", "negated"], "conditional claim");
      if (claim.type !== expected.claim.type || claim.value !== expected.claim.value || claim.suspectId !== expected.claim.suspectId || claim.negated !== expected.claim.negated) throw new Error("Official statement mismatch.");
    } else {
      keys(claim, ["type", "suspectId"], "culprit claim");
      if (claim.type !== "culprit_is" || claim.suspectId !== expected.claim.suspectId) throw new Error("Official statement mismatch.");
    }
  });
  return canonical;
}
