/**
 * src/lib/chat/routing.ts — Pure conversation-routing module.
 *
 * Author: Kiro (2026-11-05).
 *
 * Owned files: src/lib/chat/routing.ts, tests/chat-routing.test.ts,
 *              .kiro/specs/group-chat-routing/{requirements,design,tasks}.md
 *
 * This module is intentionally isolated from the game engine. It must never
 * import solver, generator, render, server-only, share-store, or any module
 * that accesses private case-resolution fields.
 */

// ── Exported types ────────────────────────────────────────────────────────────

export type ChatActor = 'kirock' | 's0' | 's1' | 's2';
export type ChatIntent = 'statement' | 'compare' | 'defend' | 'detail' | 'banter' | 'help';
export type ChatTone = 'calm' | 'dry' | 'dramatic';

export type ChatPlan = {
  speakerId: ChatActor;
  intent: ChatIntent;
  referenceId: 's0' | 's1' | 's2' | null;
  tone: ChatTone;
  interject: boolean;
};

export type ChatHistoryItem = {
  speakerId: ChatActor | 'player';
  text: string;
};

export type RoutingInput = {
  question: string;
  target: ChatActor | 'auto';
  suspects: ReadonlyArray<{ id: 's0' | 's1' | 's2'; displayName: string }>;
  history: ReadonlyArray<ChatHistoryItem>;
};

// ── Internal constants ────────────────────────────────────────────────────────

const CHAT_ACTORS: ReadonlyArray<string> = ['kirock', 's0', 's1', 's2'];
const CHAT_INTENTS: ReadonlyArray<string> = ['statement', 'compare', 'defend', 'detail', 'banter', 'help'];
const CHAT_TONES: ReadonlyArray<string> = ['calm', 'dry', 'dramatic'];
const SUSPECT_IDS: ReadonlyArray<string> = ['s0', 's1', 's2'];

/** Exactly the five fields a valid ChatPlan may contain. */
const ALLOWED_PLAN_KEYS = new Set(['speakerId', 'intent', 'referenceId', 'tone', 'interject']);

/**
 * Exact lowercase field names that must never appear in a plan response,
 * because they carry private case data.
 */
const FORBIDDEN_EXACT = new Set([
  'text',
  'reply',
  'culpritid',
  'answer',
  'confession',
  'factinverted',
  'roleassignment',
  'proofsteps',
]);

/** Substring fragments (lowercase) that indicate a private-data field name. */
const FORBIDDEN_SUBSTRINGS = ['private', 'secret', 'solution'] as const;

// ── validateChatPlan ──────────────────────────────────────────────────────────

/**
 * Validate that `raw` is an acceptable ChatPlan produced by an AI response.
 *
 * Throws TypeError for any structural, type, enum, or security violation.
 * Returns a typed ChatPlan when all checks pass.
 *
 * @param raw   - Untrusted value from an AI response.
 * @param input - The RoutingInput for this turn, used for target enforcement
 *                and referenceId validation.
 */
export function validateChatPlan(raw: unknown, input: RoutingInput): ChatPlan {
  // 1. Null / non-object guard.
  if (raw === null || raw === undefined || typeof raw !== 'object') {
    throw new TypeError(
      `[validateChatPlan] expected a plain object, got ${raw === null ? 'null' : typeof raw}`,
    );
  }

  // 2. Array guard.
  if (Array.isArray(raw)) {
    throw new TypeError('[validateChatPlan] expected a plain object, got an array');
  }

  // 3. Prototype guard — only allow plain objects and null-prototype objects.
  const proto = Object.getPrototypeOf(raw as object);
  if (proto !== Object.prototype && proto !== null) {
    throw new TypeError(
      '[validateChatPlan] expected a plain object, got an instance with a non-Object prototype',
    );
  }

  const obj = raw as Record<string, unknown>;

  // 4. Forbidden-field scan across all keys.
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();

    if (!ALLOWED_PLAN_KEYS.has(key)) {
      // Check for exact forbidden field names.
      if (FORBIDDEN_EXACT.has(lower)) {
        throw new TypeError(
          `[validateChatPlan] forbidden field "${key}" must not appear in a ChatPlan`,
        );
      }
      // Check for forbidden substrings.
      for (const sub of FORBIDDEN_SUBSTRINGS) {
        if (lower.includes(sub)) {
          throw new TypeError(
            `[validateChatPlan] field name "${key}" contains forbidden substring "${sub}"`,
          );
        }
      }
      // Any other extra field is also rejected.
      throw new TypeError(
        `[validateChatPlan] unexpected field "${key}"; only speakerId, intent, referenceId, tone, interject are allowed`,
      );
    }
  }

  // 5. Required-field presence.
  for (const required of ['speakerId', 'intent', 'referenceId', 'tone', 'interject'] as const) {
    if (!(required in obj)) {
      throw new TypeError(`[validateChatPlan] missing required field "${required}"`);
    }
  }

  // 6. Type and enum checks.

  // speakerId
  const { speakerId, intent, referenceId, tone, interject } = obj;

  if (typeof speakerId !== 'string' || !CHAT_ACTORS.includes(speakerId)) {
    throw new TypeError(
      `[validateChatPlan] speakerId must be one of ${CHAT_ACTORS.join(', ')}, got ${JSON.stringify(speakerId)}`,
    );
  }

  // intent
  if (typeof intent !== 'string' || !CHAT_INTENTS.includes(intent)) {
    throw new TypeError(
      `[validateChatPlan] intent must be one of ${CHAT_INTENTS.join(', ')}, got ${JSON.stringify(intent)}`,
    );
  }

  // referenceId
  if (referenceId !== null) {
    if (typeof referenceId !== 'string' || !SUSPECT_IDS.includes(referenceId)) {
      throw new TypeError(
        `[validateChatPlan] referenceId must be null or one of ${SUSPECT_IDS.join(', ')}, got ${JSON.stringify(referenceId)}`,
      );
    }
    // Must be a suspect present in this case's suspect list.
    const knownIds = input.suspects.map((s) => s.id);
    if (!knownIds.includes(referenceId as 's0' | 's1' | 's2')) {
      throw new TypeError(
        `[validateChatPlan] referenceId "${referenceId}" is not in the current suspects list`,
      );
    }
  }

  // tone
  if (typeof tone !== 'string' || !CHAT_TONES.includes(tone)) {
    throw new TypeError(
      `[validateChatPlan] tone must be one of ${CHAT_TONES.join(', ')}, got ${JSON.stringify(tone)}`,
    );
  }

  // interject
  if (typeof interject !== 'boolean') {
    throw new TypeError(
      `[validateChatPlan] interject must be a boolean, got ${typeof interject}`,
    );
  }

  // 7. Target enforcement — when the caller specified an explicit target,
  //    the AI must not redirect the response to a different speaker.
  if (input.target !== 'auto' && speakerId !== input.target) {
    throw new TypeError(
      `[validateChatPlan] input.target is "${input.target}" but speakerId is "${speakerId}"; they must match`,
    );
  }

  // All checks passed.
  return {
    speakerId: speakerId as ChatActor,
    intent: intent as ChatIntent,
    referenceId: (referenceId as 's0' | 's1' | 's2' | null),
    tone: tone as ChatTone,
    interject: interject as boolean,
  };
}

// ── fallbackChatPlan ──────────────────────────────────────────────────────────

/**
 * Produce a deterministic authored ChatPlan without network, AI, solver, or
 * any engine module. Recognises suspect names, @mentions, and simple question
 * categories in English and Korean.
 *
 * This is a bounded authored fallback, not claimed AI.
 *
 * @param input - The routing context for this turn.
 */
export function fallbackChatPlan(input: RoutingInput): ChatPlan {
  // Step 1 — normalise question.
  const q = input.question.normalize('NFKC').toLowerCase();

  // Step 2 — detect requests for private data or meta-manipulation.
  if (_isSensitiveRequest(q)) {
    return { speakerId: 'kirock', intent: 'help', referenceId: null, tone: 'calm', interject: false };
  }

  // Step 3 — resolve target speaker.
  const speakerId = _resolveTarget(q, input);

  // Step 4 — classify intent.
  const intent = _classifyIntent(q);

  // Step 5 — resolve referenceId.
  const referenceId = _resolveReference(q, speakerId, intent, input);

  // Step 6 — select tone.
  const tone = _selectTone(speakerId, intent);

  // Step 7 — set interject.
  const interject = _shouldInterject(speakerId, intent, referenceId);

  return { speakerId, intent, referenceId, tone, interject };
}

// ── Private helpers ───────────────────────────────────────────────────────────

/** Patterns that indicate a player is requesting private case data or trying to manipulate
 *  the game logic. Routes to kirock/help so no suspect is falsely implicated. */
function _isSensitiveRequest(q: string): boolean {
  const sensitivePatterns = [
    // English
    'answer', 'culprit', 'who did it', 'solution', 'who is guilty',
    'system prompt', 'change the answer', 'ignore instructions',
    'ignore previous', 'who is the culprit', 'tell me the answer',
    // Korean
    '정답', '범인', '누가 한 거', '해설', '시스템 프롬프트', '답 바꿔', '지시 무시',
    '범인이 누구', '정답 알려', '답을 알려',
  ];
  return sensitivePatterns.some((p) => q.includes(p));
}

/** Resolve the speaker ID from the routing input and question text.
 *  Priority: explicit target → @mention → display name → recent history → first suspect. */
function _resolveTarget(q: string, input: RoutingInput): ChatActor {
  // Priority 1: explicit target.
  if (input.target !== 'auto') {
    return input.target;
  }

  // Priority 2: @mention of a suspect ID in the question.
  for (const id of SUSPECT_IDS as ReadonlyArray<'s0' | 's1' | 's2'>) {
    if (q.includes(`@${id}`)) {
      return id;
    }
  }

  // Priority 3: suspect displayName appears in the question (NFKC, case-insensitive).
  for (const suspect of input.suspects) {
    const name = suspect.displayName.normalize('NFKC').toLowerCase();
    if (name.length > 0 && q.includes(name)) {
      return suspect.id;
    }
  }

  // Priority 4: most recent non-kirock, non-player speaker in history.
  for (let i = input.history.length - 1; i >= 0; i--) {
    const item = input.history[i];
    if (item.speakerId !== 'kirock' && item.speakerId !== 'player') {
      return item.speakerId as ChatActor;
    }
  }

  // Priority 5: first suspect, or kirock if no suspects.
  return input.suspects[0]?.id ?? 'kirock';
}

/** Classify the question into a ChatIntent based on keyword patterns. */
function _classifyIntent(q: string): ChatIntent {
  // Help: how to play, rules, what to do.
  if (
    q.includes('how to play') || q.includes('how do i') || q.includes('what should i do') ||
    q.includes('rules') || q.includes('help me') ||
    q.includes('어떻게 해') || q.includes('도움') || q.includes('규칙') || q.includes('뭘 해야')
  ) {
    return 'help';
  }

  // Banter: casual greetings / acknowledgements.
  if (
    q.includes('hello') || q.includes('hi ') || q.startsWith('hi') ||
    q.includes('hey ') || q.startsWith('hey') ||
    q.includes('thanks') || q.includes('thank you') ||
    q.includes('ok ') || q === 'ok' || q.includes('okay') ||
    q.includes('cool') || q.includes('sure') ||
    q.includes('안녕') || q.includes('감사') || q.includes('알겠어') || q.includes('좋아')
  ) {
    return 'banter';
  }

  // Compare: contradiction, differences.
  if (
    q.includes('differ') || q.includes('different') || q.includes('compare') ||
    q.includes(' vs ') || q.includes('contradiction') || q.includes('contradict') ||
    q.includes('disagree') ||
    q.includes('비교') || q.includes('다르다') || q.includes('다른') ||
    q.includes('모순') || q.includes('차이') || q.includes('반박')
  ) {
    return 'compare';
  }

  // Defend: ask an object to justify itself.
  if (
    q.includes('defend') || q.includes('explain yourself') ||
    q.includes('why did you') || q.includes('justify') ||
    q.includes('변명') || q.includes('왜 그랬') || q.includes('해명') || q.includes('설명해봐')
  ) {
    return 'defend';
  }

  // Detail: ask for more detail or clarification.
  if (
    q.includes('what do you mean') || q.includes('elaborate') ||
    q.includes('more detail') || q.includes('clarify') || q.includes('explain') ||
    q.includes('무슨 뜻') || q.includes('자세히') || q.includes('더 설명') || q.includes('명확히')
  ) {
    return 'detail';
  }

  // Default.
  return 'statement';
}

/** Resolve referenceId for compare intent; null otherwise. */
function _resolveReference(
  q: string,
  speakerId: ChatActor,
  intent: ChatIntent,
  input: RoutingInput,
): 's0' | 's1' | 's2' | null {
  if (intent !== 'compare') {
    return null;
  }

  // Gather other suspects (not the resolved speaker).
  const others = input.suspects.filter((s) => s.id !== speakerId);
  if (others.length === 0) {
    return null;
  }

  // Prefer a suspect mentioned in the question (by name or @mention).
  for (const suspect of others) {
    const name = suspect.displayName.normalize('NFKC').toLowerCase();
    if ((name.length > 0 && q.includes(name)) || q.includes(`@${suspect.id}`)) {
      return suspect.id;
    }
  }

  // Prefer the most recent other suspect in history.
  for (let i = input.history.length - 1; i >= 0; i--) {
    const actor = input.history[i].speakerId;
    if (actor !== 'player' && actor !== 'kirock' && actor !== speakerId) {
      const matchingOther = others.find((s) => s.id === actor);
      if (matchingOther) {
        return matchingOther.id;
      }
    }
  }

  // Fall back to the first other suspect.
  return others[0].id;
}

/** Select the tone based on speaker and intent. */
function _selectTone(speakerId: ChatActor, intent: ChatIntent): ChatTone {
  if (speakerId === 'kirock') return 'calm';
  if (intent === 'banter') return 'dry';
  if (intent === 'defend') return 'dramatic';
  return 'calm';
}

/** Decide whether another suspect should interject. */
function _shouldInterject(
  speakerId: ChatActor,
  intent: ChatIntent,
  referenceId: 's0' | 's1' | 's2' | null,
): boolean {
  return (
    speakerId !== 'kirock' &&
    (intent === 'compare' || intent === 'defend') &&
    referenceId !== null
  );
}
