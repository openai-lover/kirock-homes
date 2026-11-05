/**
 * src/lib/chat/performance.ts — Structural validator for AI-generated character reactions.
 *
 * Author: Kiro (2026-11-05).
 *
 * Owned files: src/lib/chat/performance.ts, tests/performance.test.ts,
 *              .kiro/specs/live-dialogue/{requirements,design,tasks}.md
 *
 * ─── WHAT THIS MODULE IS ───────────────────────────────────────────────────────
 *
 * A Performance is a short burst of NON-EVIDENTIARY character reactions produced
 * by an AI model — emotional colour, banter, deflection — that accompanies a
 * turn. Official evidence (public statements, authored case copy) is always
 * rendered separately by code and is NEVER part of a Performance.
 *
 * ─── VALIDATION SCOPE AND LIMITS ──────────────────────────────────────────────
 *
 * `validatePerformance` performs STRUCTURAL validation only:
 *   • shape, key set, field types, length, character range, enum membership.
 *
 * It does NOT guarantee semantic safety.  A structurally valid Performance can
 * still contain text that implies guilt, paraphrases testimony, or reveals
 * private case data.  Preventing that requires a separate AI "review" pass
 * (see `performanceReviewPassed`) whose semantic judgement is probabilistic,
 * not provable.  This module provides defense-in-depth, not an absolute
 * semantic proof.
 *
 * The conservative pattern-based confession/verdict guard in this module is an
 * additional layer of defense in depth.  It catches obvious direct patterns
 * (e.g. "I did it", "I am the culprit") in English and Korean but CANNOT
 * detect all paraphrases, indirect admissions, or novel phrasings.  It is
 * explicitly not a substitute for semantic review.
 *
 * ─── IMPORT RESTRICTIONS ──────────────────────────────────────────────────────
 *
 * This module must never import solver, generator, render, server-only,
 * share-store, AI modules, or any module that exposes private case data.
 * The private solution is not an argument to any function here.
 */

// ── Exported types ─────────────────────────────────────────────────────────────

/**
 * A single line of non-evidentiary dialogue produced for one character in a turn.
 *
 * - `speakerId` — which actor speaks this line.
 * - `text`      — display-ready reaction text; 1–240 characters after trimming.
 * - `quoteIds`  — zero to two public-statement IDs this line refers back to.
 *                 IDs must come from the case's public statements only; they
 *                 do not carry statement text (that is always rendered by code).
 */
export type PerformanceLine = {
  speakerId: 'kirock' | 's0' | 's1' | 's2';
  text: string;
  quoteIds: string[];
};

/**
 * A complete performance for one turn: 1–2 PerformanceLines.
 *
 * Multiple lines allow a secondary character to interject, but repetition of
 * the same speaker within one Performance is not allowed.
 */
export type Performance = {
  lines: PerformanceLine[];
};

// ── Internal constants ─────────────────────────────────────────────────────────

const SPEAKER_IDS = new Set<string>(['kirock', 's0', 's1', 's2']);

/** Exactly the three fields a PerformanceLine may contain. */
const ALLOWED_LINE_KEYS = new Set(['speakerId', 'text', 'quoteIds']);

/** Exactly the one field a Performance may contain. */
const ALLOWED_PERFORMANCE_KEYS = new Set(['lines']);

/**
 * Fields that must never appear in a Performance or PerformanceLine response
 * because they carry private case data.  Checked case-insensitively.
 */
const FORBIDDEN_EXACT = new Set([
  'answer',
  'culprit',
  'culpritid',
  'confession',
  'factinverted',
  'roleassignment',
  'proofsteps',
  'proof',
  'solution',
  'verdict',
  'guilty',
]);

/** Substring fragments (lowercase) that indicate a private-data field name. */
const FORBIDDEN_SUBSTRINGS = ['private', 'secret'] as const;

/**
 * Maximum allowed text length (characters) after trimming.
 *
 * Chosen to allow a natural sentence or two while preventing generated monologues
 * that would displace authored evidence.
 */
const TEXT_MAX_CHARS = 240;

/**
 * Conservative pattern-based guard against direct confession / verdict phrases.
 *
 * IMPORTANT: This is defense-in-depth only.  It catches obvious literal
 * patterns in English and Korean but cannot prevent indirect admissions,
 * paraphrases, or novel formulations.  It is NOT a semantic proof.  A
 * passing check here does not certify the text is free of solution leaks.
 *
 * Patterns (case-insensitive, Unicode-normalised):
 *   English: "i did it", "i am the culprit", "i am guilty", "i am the one",
 *            "i committed", "it was me", "the culprit is", "the answer is",
 *            "the guilty one is", "i confess"
 *   Korean: "내가 했어", "내가 범인", "내가 범인이야", "제가 했어요", "범인은",
 *           "정답은", "내가 한 거야", "내가 저질렀어", "나야", "나 맞아"
 */
const CONFESSION_PATTERNS_EN = [
  /\bi\s+did\s+it\b/i,
  /\bi\s+am\s+(the\s+)?culprit\b/i,
  /\bi\s+am\s+guilty\b/i,
  /\bi\s+am\s+the\s+one\b/i,
  /\bi\s+committed\b/i,
  /\bit\s+was\s+me\b/i,
  /\bthe\s+culprit\s+is\b/i,
  /\bthe\s+answer\s+is\b/i,
  /\bthe\s+guilty\s+(one\s+)?is\b/i,
  /\bi\s+confess\b/i,
];

const CONFESSION_PATTERNS_KO = [
  /내가\s*했어/,
  /내가\s*범인/,
  /제가\s*했어요/,
  /범인은/,
  /정답은/,
  /내가\s*한\s*거야/,
  /내가\s*저질렀/,
];

// ── Private helpers ────────────────────────────────────────────────────────────

/** Return true if the value is a plain object (not null, array, or class instance). */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v as object);
  return proto === Object.prototype || proto === null;
}

/**
 * Scan an object's keys for forbidden field names.
 * Throws TypeError on first match.
 */
function rejectForbiddenKeys(obj: Record<string, unknown>, context: string): void {
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_EXACT.has(lower)) {
      throw new TypeError(
        `[validatePerformance] forbidden field "${key}" must not appear in ${context}`,
      );
    }
    for (const sub of FORBIDDEN_SUBSTRINGS) {
      if (lower.includes(sub)) {
        throw new TypeError(
          `[validatePerformance] field "${key}" contains forbidden substring "${sub}" in ${context}`,
        );
      }
    }
  }
}

/**
 * Conservative pattern guard against direct confession / verdict phrases.
 *
 * Defense-in-depth only — see module header.
 * Returns the matching pattern string if found, undefined otherwise.
 */
function findDirectConfessionPattern(text: string): string | undefined {
  const normalised = text.normalize('NFKC');
  for (const re of CONFESSION_PATTERNS_EN) {
    if (re.test(normalised)) return re.source;
  }
  for (const re of CONFESSION_PATTERNS_KO) {
    if (re.test(normalised)) return re.source;
  }
  return undefined;
}

// ── validatePerformanceLine ────────────────────────────────────────────────────

/**
 * Validate one PerformanceLine from a raw value.
 *
 * @param raw            - Untrusted value.
 * @param index          - Line index for error messages.
 * @param input          - The turn's routing input (for ID validation).
 * @param seenSpeakers   - Set of speakerIds already seen; updated in place.
 */
function validatePerformanceLine(
  raw: unknown,
  index: number,
  input: { target: 'auto' | 'kirock' | 's0' | 's1' | 's2'; statementIds: readonly string[]; suspectIds: readonly string[] },
  seenSpeakers: Set<string>,
): PerformanceLine {
  const ctx = `line[${index}]`;

  // 1. Plain object check.
  if (!isPlainObject(raw)) {
    throw new TypeError(
      `[validatePerformance] ${ctx} must be a plain object, got ${raw === null ? 'null' : typeof raw}`,
    );
  }

  // 2. Reject forbidden keys (private data / solution fields).
  rejectForbiddenKeys(raw, ctx);

  // 3. Reject unexpected keys.
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_LINE_KEYS.has(key)) {
      throw new TypeError(
        `[validatePerformance] unexpected field "${key}" in ${ctx}; only speakerId, text, quoteIds are allowed`,
      );
    }
  }

  // 4. Required field presence.
  for (const f of ['speakerId', 'text', 'quoteIds'] as const) {
    if (!(f in raw)) {
      throw new TypeError(`[validatePerformance] missing required field "${f}" in ${ctx}`);
    }
  }

  const { speakerId, text, quoteIds } = raw;

  // 5. speakerId — must be a valid actor and present in this case.
  if (typeof speakerId !== 'string' || !SPEAKER_IDS.has(speakerId)) {
    throw new TypeError(
      `[validatePerformance] ${ctx}.speakerId must be 'kirock'|'s0'|'s1'|'s2', got ${JSON.stringify(speakerId)}`,
    );
  }
  // speakerId must be kirock or a suspect present in this case.
  if (speakerId !== 'kirock' && !input.suspectIds.includes(speakerId)) {
    throw new TypeError(
      `[validatePerformance] ${ctx}.speakerId "${speakerId}" is not present in suspectIds`,
    );
  }

  // 6. No repeated speaker across lines.
  if (seenSpeakers.has(speakerId)) {
    throw new TypeError(
      `[validatePerformance] speaker "${speakerId}" appears more than once in Performance.lines`,
    );
  }
  seenSpeakers.add(speakerId);

  // 7. text — string, 1–240 chars after trimming, no control characters, no HTML tags,
  //           no URLs, no code fences.
  if (typeof text !== 'string') {
    throw new TypeError(
      `[validatePerformance] ${ctx}.text must be a string, got ${typeof text}`,
    );
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new TypeError(`[validatePerformance] ${ctx}.text must not be empty after trimming`);
  }
  if (trimmed.length > TEXT_MAX_CHARS) {
    throw new TypeError(
      `[validatePerformance] ${ctx}.text exceeds ${TEXT_MAX_CHARS} characters (got ${trimmed.length})`,
    );
  }
  // Code fences (```) — checked before control characters so multi-line fence strings
  // produce the "code fence" error rather than "control characters".
  if (/```/.test(trimmed)) {
    throw new TypeError(`[validatePerformance] ${ctx}.text contains a code fence`);
  }
  // HTML tags.
  if (/<[a-zA-Z!/?]/.test(trimmed)) {
    throw new TypeError(`[validatePerformance] ${ctx}.text contains HTML`);
  }
  // URLs (http/https/ftp).
  if (/https?:\/\/|ftp:\/\//i.test(trimmed)) {
    throw new TypeError(`[validatePerformance] ${ctx}.text contains a URL`);
  }
  // Control characters (C0 and C1: U+0000–U+001F, U+007F–U+009F).
  // Reaction text is a single display line; tabs, newlines, and other control characters
  // are not permitted.
  if (/[\u0000-\u001F\u007F-\u009F]/.test(trimmed)) {
    throw new TypeError(
      `[validatePerformance] ${ctx}.text contains control characters`,
    );
  }

  // 8. Conservative defense-in-depth confession/verdict pattern check.
  //    This catches obvious literal patterns only — see module header for limits.
  const pattern = findDirectConfessionPattern(trimmed);
  if (pattern !== undefined) {
    throw new TypeError(
      `[validatePerformance] ${ctx}.text matches a direct confession/verdict pattern (defense-in-depth guard): ${pattern}`,
    );
  }

  // 9. quoteIds — must be an array, 0–2 entries, each a string from statementIds, no duplicates.
  if (!Array.isArray(quoteIds)) {
    throw new TypeError(
      `[validatePerformance] ${ctx}.quoteIds must be an array, got ${typeof quoteIds}`,
    );
  }
  if (quoteIds.length > 2) {
    throw new TypeError(
      `[validatePerformance] ${ctx}.quoteIds may contain at most 2 IDs, got ${quoteIds.length}`,
    );
  }
  const seenQuoteIds = new Set<string>();
  for (let i = 0; i < quoteIds.length; i++) {
    const qid = quoteIds[i];
    if (typeof qid !== 'string') {
      throw new TypeError(
        `[validatePerformance] ${ctx}.quoteIds[${i}] must be a string, got ${typeof qid}`,
      );
    }
    if (!input.statementIds.includes(qid)) {
      throw new TypeError(
        `[validatePerformance] ${ctx}.quoteIds[${i}] "${qid}" is not a known public statement ID`,
      );
    }
    if (seenQuoteIds.has(qid)) {
      throw new TypeError(
        `[validatePerformance] ${ctx}.quoteIds contains duplicate ID "${qid}"`,
      );
    }
    seenQuoteIds.add(qid);
  }

  return {
    speakerId: speakerId as PerformanceLine['speakerId'],
    text: trimmed,
    quoteIds: quoteIds as string[],
  };
}

// ── validatePerformance ────────────────────────────────────────────────────────

/**
 * Validate that `raw` is an acceptable Performance produced by an AI response.
 *
 * STRUCTURAL VALIDATION ONLY.  This function cannot guarantee semantic safety
 * (see module header).
 *
 * Throws TypeError for any structural, type, enum, range, or security violation.
 * Returns a typed Performance when all checks pass.
 *
 * @param raw   - Untrusted value from an AI response.
 * @param input - The context for this turn:
 *                  `target`       — explicit target speaker, or 'auto'.
 *                  `statementIds` — IDs of public statements visible to the player.
 *                  `suspectIds`   — IDs of the three suspects in this case.
 */
export function validatePerformance(
  raw: unknown,
  input: {
    target: 'auto' | 'kirock' | 's0' | 's1' | 's2';
    statementIds: readonly string[];
    suspectIds: readonly string[];
  },
): Performance {
  // 1. Plain object check.
  if (!isPlainObject(raw)) {
    throw new TypeError(
      `[validatePerformance] expected a plain object, got ${raw === null ? 'null' : typeof raw}`,
    );
  }

  // 2. Reject forbidden keys at the top level.
  rejectForbiddenKeys(raw, 'Performance');

  // 3. Reject unexpected keys.
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_PERFORMANCE_KEYS.has(key)) {
      throw new TypeError(
        `[validatePerformance] unexpected field "${key}" in Performance; only "lines" is allowed`,
      );
    }
  }

  // 4. Required field: lines.
  if (!('lines' in raw)) {
    throw new TypeError(`[validatePerformance] missing required field "lines" in Performance`);
  }

  const { lines } = raw;

  // 5. lines must be an array.
  if (!Array.isArray(lines)) {
    throw new TypeError(
      `[validatePerformance] Performance.lines must be an array, got ${typeof lines}`,
    );
  }

  // 6. 1–2 lines.
  if (lines.length < 1 || lines.length > 2) {
    throw new TypeError(
      `[validatePerformance] Performance.lines must have 1 or 2 entries, got ${lines.length}`,
    );
  }

  // 7. Validate each line; track speakers for duplicate-speaker check.
  const seenSpeakers = new Set<string>();
  const validatedLines: PerformanceLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    validatedLines.push(validatePerformanceLine(lines[i], i, input, seenSpeakers));
  }

  // 8. First speaker must match explicit target (if not 'auto').
  if (input.target !== 'auto') {
    const firstSpeaker = validatedLines[0].speakerId;
    if (firstSpeaker !== input.target) {
      throw new TypeError(
        `[validatePerformance] input.target is "${input.target}" but first speaker is "${firstSpeaker}"; they must match`,
      );
    }
  }

  return { lines: validatedLines };
}

// ── performanceReviewPassed ────────────────────────────────────────────────────

/**
 * Validate that `raw` is an acceptable "review" approval object produced by a
 * second AI pass.
 *
 * STRUCTURAL VALIDATION ONLY.  This checks that the reviewing model returned
 * the exact expected shape:
 *   { approved: true, newFact: false, solutionLeak: false, statementRewrite: false }
 *
 * All four keys must be present with those exact literal values; no extra keys
 * are permitted.  Any deviation means the review did not pass.
 *
 * IMPORTANT: A passing review check does NOT prove the associated Performance
 * is semantically safe.  The reviewing model is probabilistic and can make
 * mistakes.  `performanceReviewPassed` checks only that the reviewer returned
 * the expected structure — it does not independently verify the Performance
 * content.  The full defense-in-depth chain is:
 *
 *   1. Structural validation (this module) — rejects obvious structural flaws.
 *   2. Conservative pattern guard (this module) — rejects obvious direct confessions.
 *   3. AI semantic review — probabilistic; caught by performanceReviewPassed.
 *   4. Authored fallback rendering — official evidence always rendered by code.
 *
 * @param raw - Untrusted value from a review AI response.
 * @returns true if and only if `raw` is exactly the expected approval object.
 */
export function performanceReviewPassed(raw: unknown): boolean {
  // Must be a plain object.
  if (!isPlainObject(raw)) return false;

  const obj = raw;
  const keys = Object.keys(obj);

  // Exactly four keys.
  if (keys.length !== 4) return false;

  // All four exact keys must be present with their exact literal values.
  if (obj['approved'] !== true) return false;
  if (obj['newFact'] !== false) return false;
  if (obj['solutionLeak'] !== false) return false;
  if (obj['statementRewrite'] !== false) return false;

  // No extra keys beyond the expected four.
  const expectedKeys = new Set(['approved', 'newFact', 'solutionLeak', 'statementRewrite']);
  for (const key of keys) {
    if (!expectedKeys.has(key)) return false;
  }

  return true;
}
