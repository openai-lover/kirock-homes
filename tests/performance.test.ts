/**
 * tests/performance.test.ts
 *
 * Author: Kiro (2026-11-05).
 *
 * Tests for src/lib/chat/performance.ts — structural validation only.
 * No external services, no private case data, no credentials.
 *
 * Run:
 *   /Users/kyumin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
 *     --import tsx --test tests/performance.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validatePerformance,
  performanceReviewPassed,
  type Performance,
  type PerformanceLine,
} from '../src/lib/chat/performance';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** A minimal valid input that most tests can reuse. */
const BASE_INPUT = {
  target: 'auto' as const,
  statementIds: ['st-1', 'st-2', 'st-3'],
  suspectIds: ['s0', 's1', 's2'],
};

/** Build a minimal valid one-line Performance object. */
function validOneLine(overrides?: Partial<PerformanceLine>): unknown {
  return {
    lines: [
      {
        speakerId: 's0',
        text: 'That has nothing to do with me.',
        quoteIds: [],
        ...overrides,
      },
    ],
  };
}

/** Build a minimal valid two-line Performance object. */
function validTwoLines(): unknown {
  return {
    lines: [
      { speakerId: 's0', text: 'I was nowhere near the lamp.', quoteIds: ['st-1'] },
      { speakerId: 's1', text: 'That matches what I said.', quoteIds: [] },
    ],
  };
}

function assertThrowsType(fn: () => unknown, msgFragment: string): void {
  try {
    fn();
    assert.fail(`Expected TypeError but no error was thrown`);
  } catch (err) {
    assert.ok(err instanceof TypeError, `Expected TypeError, got ${(err as Error)?.constructor?.name}`);
    assert.ok(
      (err as TypeError).message.includes(msgFragment),
      `Expected message to include "${msgFragment}" but got: ${(err as TypeError).message}`,
    );
  }
}

// ── validatePerformance — top-level structural checks ─────────────────────────

describe('validatePerformance — top-level shape', () => {
  it('accepts a valid one-line Performance', () => {
    const result = validatePerformance(validOneLine(), BASE_INPUT);
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0].speakerId, 's0');
    assert.equal(result.lines[0].text, 'That has nothing to do with me.');
    assert.deepEqual(result.lines[0].quoteIds, []);
  });

  it('accepts a valid two-line Performance', () => {
    const result = validatePerformance(validTwoLines(), BASE_INPUT);
    assert.equal(result.lines.length, 2);
  });

  it('accepts kirock as speaker', () => {
    const raw = { lines: [{ speakerId: 'kirock', text: 'Interesting question.', quoteIds: [] }] };
    const result = validatePerformance(raw, BASE_INPUT);
    assert.equal(result.lines[0].speakerId, 'kirock');
  });

  it('trims surrounding whitespace from text', () => {
    const raw = { lines: [{ speakerId: 's0', text: '  Hello.  ', quoteIds: [] }] };
    const result = validatePerformance(raw, BASE_INPUT);
    assert.equal(result.lines[0].text, 'Hello.');
  });

  it('rejects null', () => {
    assertThrowsType(() => validatePerformance(null, BASE_INPUT), 'expected a plain object');
  });

  it('rejects a string', () => {
    assertThrowsType(() => validatePerformance('hello', BASE_INPUT), 'expected a plain object');
  });

  it('rejects an array', () => {
    assertThrowsType(() => validatePerformance([], BASE_INPUT), 'expected a plain object');
  });

  it('rejects a class instance', () => {
    class Foo {}
    assertThrowsType(() => validatePerformance(new Foo(), BASE_INPUT), 'expected a plain object');
  });

  it('rejects missing "lines" field', () => {
    assertThrowsType(() => validatePerformance({}, BASE_INPUT), 'missing required field "lines"');
  });

  it('rejects when lines is not an array', () => {
    assertThrowsType(
      () => validatePerformance({ lines: 'foo' }, BASE_INPUT),
      'Performance.lines must be an array',
    );
  });

  it('rejects empty lines array', () => {
    assertThrowsType(
      () => validatePerformance({ lines: [] }, BASE_INPUT),
      'must have 1 or 2 entries',
    );
  });

  it('rejects three lines', () => {
    const raw = {
      lines: [
        { speakerId: 's0', text: 'Line one.', quoteIds: [] },
        { speakerId: 's1', text: 'Line two.', quoteIds: [] },
        { speakerId: 's2', text: 'Line three.', quoteIds: [] },
      ],
    };
    assertThrowsType(() => validatePerformance(raw, BASE_INPUT), 'must have 1 or 2 entries');
  });

  it('rejects unexpected top-level key', () => {
    const raw = { lines: [{ speakerId: 's0', text: 'Fine.', quoteIds: [] }], extra: 1 };
    assertThrowsType(() => validatePerformance(raw, BASE_INPUT), 'unexpected field "extra"');
  });
});

// ── validatePerformance — forbidden top-level keys ────────────────────────────

describe('validatePerformance — forbidden keys at top level', () => {
  const forbiddenFields: Array<[string, string]> = [
    ['answer', 'forbidden field'],
    ['culprit', 'forbidden field'],
    ['culpritId', 'forbidden field'],
    ['confession', 'forbidden field'],
    ['proof', 'forbidden field'],
    ['proofSteps', 'forbidden field'],
    ['solution', 'forbidden field'],
    ['verdict', 'forbidden field'],
    ['privateData', 'forbidden substring'],
    ['secretKey', 'forbidden substring'],
  ];

  for (const [field, fragment] of forbiddenFields) {
    it(`rejects top-level field "${field}"`, () => {
      const raw: Record<string, unknown> = {
        lines: [{ speakerId: 's0', text: 'OK.', quoteIds: [] }],
        [field]: 'x',
      };
      assertThrowsType(() => validatePerformance(raw, BASE_INPUT), fragment);
    });
  }
});

// ── validatePerformance — line-level field checks ─────────────────────────────

describe('validatePerformance — line shape', () => {
  it('rejects null line', () => {
    assertThrowsType(
      () => validatePerformance({ lines: [null] }, BASE_INPUT),
      'must be a plain object',
    );
  });

  it('rejects array as line', () => {
    assertThrowsType(
      () => validatePerformance({ lines: [[]] }, BASE_INPUT),
      'must be a plain object',
    );
  });

  it('rejects missing speakerId', () => {
    const raw = { lines: [{ text: 'Hello.', quoteIds: [] }] };
    assertThrowsType(() => validatePerformance(raw, BASE_INPUT), 'missing required field "speakerId"');
  });

  it('rejects missing text', () => {
    const raw = { lines: [{ speakerId: 's0', quoteIds: [] }] };
    assertThrowsType(() => validatePerformance(raw, BASE_INPUT), 'missing required field "text"');
  });

  it('rejects missing quoteIds', () => {
    const raw = { lines: [{ speakerId: 's0', text: 'OK.' }] };
    assertThrowsType(() => validatePerformance(raw, BASE_INPUT), 'missing required field "quoteIds"');
  });

  it('rejects unexpected field in line', () => {
    const raw = { lines: [{ speakerId: 's0', text: 'OK.', quoteIds: [], extra: 1 }] };
    assertThrowsType(() => validatePerformance(raw, BASE_INPUT), 'unexpected field "extra"');
  });
});

// ── validatePerformance — speakerId checks ────────────────────────────────────

describe('validatePerformance — speakerId', () => {
  it('rejects numeric speakerId', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ speakerId: 42 as unknown as 's0' }), BASE_INPUT),
      'speakerId must be',
    );
  });

  it('rejects unknown string speakerId', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ speakerId: 's3' as 's0' }), BASE_INPUT),
      'speakerId must be',
    );
  });

  it('rejects speakerId "player"', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ speakerId: 'player' as 's0' }), BASE_INPUT),
      'speakerId must be',
    );
  });

  it('rejects suspect not present in suspectIds', () => {
    const input = { ...BASE_INPUT, suspectIds: ['s0', 's1'] };
    assertThrowsType(
      () => validatePerformance(validOneLine({ speakerId: 's2' }), input),
      'not present in suspectIds',
    );
  });

  it('accepts s0, s1, s2 when all are present', () => {
    for (const id of ['s0', 's1', 's2'] as const) {
      const result = validatePerformance(validOneLine({ speakerId: id }), BASE_INPUT);
      assert.equal(result.lines[0].speakerId, id);
    }
  });
});

// ── validatePerformance — target enforcement ──────────────────────────────────

describe('validatePerformance — target enforcement', () => {
  it('accepts when target is auto and speaker is any valid actor', () => {
    const result = validatePerformance(validOneLine({ speakerId: 's2' }), {
      ...BASE_INPUT,
      target: 'auto',
    });
    assert.equal(result.lines[0].speakerId, 's2');
  });

  it('accepts when explicit target matches first speaker', () => {
    const result = validatePerformance(validOneLine({ speakerId: 's1' }), {
      ...BASE_INPUT,
      target: 's1',
    });
    assert.equal(result.lines[0].speakerId, 's1');
  });

  it('rejects when explicit target s0 but first speaker is s1', () => {
    assertThrowsType(
      () =>
        validatePerformance(validOneLine({ speakerId: 's1' }), {
          ...BASE_INPUT,
          target: 's0',
        }),
      'first speaker is "s1"',
    );
  });

  it('rejects when explicit target kirock but first speaker is s0', () => {
    assertThrowsType(
      () =>
        validatePerformance(validOneLine({ speakerId: 's0' }), {
          ...BASE_INPUT,
          target: 'kirock',
        }),
      'first speaker is "s0"',
    );
  });

  it('accepts kirock target matching kirock speaker', () => {
    const raw = { lines: [{ speakerId: 'kirock', text: 'Noted.', quoteIds: [] }] };
    const result = validatePerformance(raw, { ...BASE_INPUT, target: 'kirock' });
    assert.equal(result.lines[0].speakerId, 'kirock');
  });

  it('target only constrains first line; second line may differ', () => {
    const raw = {
      lines: [
        { speakerId: 's0', text: 'My view.', quoteIds: [] },
        { speakerId: 's1', text: 'Mine differs.', quoteIds: [] },
      ],
    };
    const result = validatePerformance(raw, { ...BASE_INPUT, target: 's0' });
    assert.equal(result.lines[1].speakerId, 's1');
  });
});

// ── validatePerformance — repeated speaker check ──────────────────────────────

describe('validatePerformance — no repeated speakers', () => {
  it('rejects two lines with the same speaker', () => {
    const raw = {
      lines: [
        { speakerId: 's0', text: 'First.', quoteIds: [] },
        { speakerId: 's0', text: 'Second.', quoteIds: [] },
      ],
    };
    assertThrowsType(
      () => validatePerformance(raw, BASE_INPUT),
      'appears more than once',
    );
  });

  it('accepts two lines with different speakers', () => {
    const result = validatePerformance(validTwoLines(), BASE_INPUT);
    assert.equal(result.lines[0].speakerId, 's0');
    assert.equal(result.lines[1].speakerId, 's1');
  });
});

// ── validatePerformance — text length limits ──────────────────────────────────

describe('validatePerformance — text length', () => {
  it('accepts text of exactly 1 character', () => {
    const result = validatePerformance(validOneLine({ text: 'A' }), BASE_INPUT);
    assert.equal(result.lines[0].text, 'A');
  });

  it('accepts text of exactly 240 characters', () => {
    const text = 'A'.repeat(240);
    const result = validatePerformance(validOneLine({ text }), BASE_INPUT);
    assert.equal(result.lines[0].text, text);
  });

  it('rejects text of 241 characters', () => {
    const text = 'A'.repeat(241);
    assertThrowsType(
      () => validatePerformance(validOneLine({ text }), BASE_INPUT),
      'exceeds 240 characters',
    );
  });

  it('rejects empty string', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: '' }), BASE_INPUT),
      'must not be empty',
    );
  });

  it('rejects whitespace-only string', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: '   ' }), BASE_INPUT),
      'must not be empty',
    );
  });

  it('text of 240 chars + surrounding spaces trims to 240 (accepted)', () => {
    const text = ' ' + 'A'.repeat(240) + ' ';
    const result = validatePerformance(validOneLine({ text }), BASE_INPUT);
    assert.equal(result.lines[0].text.length, 240);
  });

  it('rejects text where trimmed length is 241', () => {
    const text = ' ' + 'A'.repeat(241) + ' ';
    assertThrowsType(
      () => validatePerformance(validOneLine({ text }), BASE_INPUT),
      'exceeds 240 characters',
    );
  });
});

// ── validatePerformance — unsafe content in text ──────────────────────────────

describe('validatePerformance — text XSS / unsafe content', () => {
  it('rejects text with an HTML open tag', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: 'Hello <script>alert(1)</script>' }), BASE_INPUT),
      'contains HTML',
    );
  });

  it('rejects text with an HTML img tag', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: '<img src=x onerror=alert(1)>' }), BASE_INPUT),
      'contains HTML',
    );
  });

  it('rejects text with a closing HTML tag', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: 'Hello </b> world' }), BASE_INPUT),
      'contains HTML',
    );
  });

  it('rejects text with an https URL', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: 'Visit https://evil.example.com' }), BASE_INPUT),
      'contains a URL',
    );
  });

  it('rejects text with an http URL', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: 'See http://example.com for details' }), BASE_INPUT),
      'contains a URL',
    );
  });

  it('rejects text with a code fence', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: '```\nalert(1)\n```' }), BASE_INPUT),
      'contains a code fence',
    );
  });

  it('rejects text with a null byte (control character)', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: 'Hello\u0000world' }), BASE_INPUT),
      'contains control characters',
    );
  });

  it('rejects text with a CR character', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ text: 'Hello\rworld' }), BASE_INPUT),
      'contains control characters',
    );
  });

  it('accepts text with a harmless apostrophe and dash', () => {
    const result = validatePerformance(
      validOneLine({ text: "It wasn't me — I'm certain of that." }),
      BASE_INPUT,
    );
    assert.ok(result.lines[0].text.length > 0);
  });
});

// ── validatePerformance — unsafe direct verdict patterns (defense-in-depth) ───

describe('validatePerformance — confession/verdict pattern guard (defense-in-depth)', () => {
  // English patterns
  const unsafeEnglish = [
    'I did it, I confess everything.',
    'I am the culprit, believe me.',
    'I am guilty of the whole thing.',
    'It was me who spilled the coffee.',
    'The culprit is standing right here.',
    'The answer is obvious: it was the lamp.',
    'I commit to telling you I committed the act.',
    'I confess to everything.',
    'I am the one who caused this.',
  ];

  for (const text of unsafeEnglish) {
    it(`rejects EN: "${text.substring(0, 50)}"`, () => {
      assertThrowsType(
        () => validatePerformance(validOneLine({ text }), BASE_INPUT),
        'direct confession/verdict pattern',
      );
    });
  }

  // Korean patterns
  const unsafeKorean = [
    '내가 했어, 사실이야.',
    '내가 범인이라고.',
    '제가 했어요, 믿어주세요.',
    '범인은 바로 나야.',
    '정답은 내가 한 거야.',
    '내가 한 거야, 진짜로.',
    '내가 저질렀어.',
  ];

  for (const text of unsafeKorean) {
    it(`rejects KO: "${text}"`, () => {
      assertThrowsType(
        () => validatePerformance(validOneLine({ text }), BASE_INPUT),
        'direct confession/verdict pattern',
      );
    });
  }

  it('accepts innocent-sounding text that does not match patterns', () => {
    const result = validatePerformance(
      validOneLine({ text: 'I was working at my desk the whole time.' }),
      BASE_INPUT,
    );
    assert.ok(result.lines[0].text.length > 0);
  });
});

// ── validatePerformance — forbidden fields inside lines ───────────────────────

describe('validatePerformance — forbidden fields inside lines', () => {
  const forbiddenLineFields: Array<[string, string]> = [
    ['answer', 'forbidden field'],
    ['culprit', 'forbidden field'],
    ['culpritId', 'forbidden field'],
    ['confession', 'forbidden field'],
    ['proof', 'forbidden field'],
    ['verdict', 'forbidden field'],
    ['privateNote', 'forbidden substring'],
    ['secretHint', 'forbidden substring'],
  ];

  for (const [field, fragment] of forbiddenLineFields) {
    it(`rejects line with field "${field}"`, () => {
      const raw = {
        lines: [
          {
            speakerId: 's0',
            text: 'Fine.',
            quoteIds: [],
            [field]: 'x',
          },
        ],
      };
      assertThrowsType(() => validatePerformance(raw, BASE_INPUT), fragment);
    });
  }
});

// ── validatePerformance — quoteIds checks ─────────────────────────────────────

describe('validatePerformance — quoteIds', () => {
  it('accepts quoteIds with zero entries', () => {
    const result = validatePerformance(validOneLine({ quoteIds: [] }), BASE_INPUT);
    assert.deepEqual(result.lines[0].quoteIds, []);
  });

  it('accepts quoteIds with one valid ID', () => {
    const result = validatePerformance(validOneLine({ quoteIds: ['st-1'] }), BASE_INPUT);
    assert.deepEqual(result.lines[0].quoteIds, ['st-1']);
  });

  it('accepts quoteIds with two valid IDs', () => {
    const result = validatePerformance(validOneLine({ quoteIds: ['st-1', 'st-2'] }), BASE_INPUT);
    assert.deepEqual(result.lines[0].quoteIds, ['st-1', 'st-2']);
  });

  it('rejects quoteIds with three entries', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ quoteIds: ['st-1', 'st-2', 'st-3'] }), BASE_INPUT),
      'at most 2 IDs',
    );
  });

  it('rejects quoteIds with an unknown statement ID', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ quoteIds: ['st-unknown'] }), BASE_INPUT),
      'not a known public statement ID',
    );
  });

  it('rejects quoteIds with a duplicate ID', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ quoteIds: ['st-1', 'st-1'] }), BASE_INPUT),
      'duplicate ID',
    );
  });

  it('rejects quoteIds that is not an array', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ quoteIds: 'st-1' as unknown as string[] }), BASE_INPUT),
      'must be an array',
    );
  });

  it('rejects quoteIds containing a non-string entry', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ quoteIds: [42] as unknown as string[] }), BASE_INPUT),
      'must be a string',
    );
  });
});

// ── validatePerformance — unknown reference IDs ───────────────────────────────

describe('validatePerformance — unknown references', () => {
  it('rejects a suspect that is not in suspectIds', () => {
    const input = { ...BASE_INPUT, suspectIds: ['s0', 's1'] };
    assertThrowsType(
      () => validatePerformance(validOneLine({ speakerId: 's2' }), input),
      'not present in suspectIds',
    );
  });

  it('rejects a quoteId referencing a statement not in statementIds', () => {
    assertThrowsType(
      () => validatePerformance(validOneLine({ quoteIds: ['not-a-real-id'] }), BASE_INPUT),
      'not a known public statement ID',
    );
  });
});

// ── performanceReviewPassed ────────────────────────────────────────────────────

describe('performanceReviewPassed', () => {
  it('returns true for exact approval object', () => {
    assert.equal(
      performanceReviewPassed({
        approved: true,
        newFact: false,
        solutionLeak: false,
        statementRewrite: false,
      }),
      true,
    );
  });

  it('returns false for null', () => {
    assert.equal(performanceReviewPassed(null), false);
  });

  it('returns false for a string', () => {
    assert.equal(performanceReviewPassed('yes'), false);
  });

  it('returns false for an array', () => {
    assert.equal(performanceReviewPassed([]), false);
  });

  it('returns false when approved is false', () => {
    assert.equal(
      performanceReviewPassed({
        approved: false,
        newFact: false,
        solutionLeak: false,
        statementRewrite: false,
      }),
      false,
    );
  });

  it('returns false when newFact is true', () => {
    assert.equal(
      performanceReviewPassed({
        approved: true,
        newFact: true,
        solutionLeak: false,
        statementRewrite: false,
      }),
      false,
    );
  });

  it('returns false when solutionLeak is true', () => {
    assert.equal(
      performanceReviewPassed({
        approved: true,
        newFact: false,
        solutionLeak: true,
        statementRewrite: false,
      }),
      false,
    );
  });

  it('returns false when statementRewrite is true', () => {
    assert.equal(
      performanceReviewPassed({
        approved: true,
        newFact: false,
        solutionLeak: false,
        statementRewrite: true,
      }),
      false,
    );
  });

  it('returns false when approved is string "true"', () => {
    assert.equal(
      performanceReviewPassed({
        approved: 'true',
        newFact: false,
        solutionLeak: false,
        statementRewrite: false,
      }),
      false,
    );
  });

  it('returns false when there is an extra key', () => {
    assert.equal(
      performanceReviewPassed({
        approved: true,
        newFact: false,
        solutionLeak: false,
        statementRewrite: false,
        extra: 'x',
      }),
      false,
    );
  });

  it('returns false when a required key is missing', () => {
    assert.equal(
      performanceReviewPassed({
        approved: true,
        newFact: false,
        solutionLeak: false,
        // statementRewrite missing
      }),
      false,
    );
  });

  it('returns false for empty object', () => {
    assert.equal(performanceReviewPassed({}), false);
  });

  it('returns false when values are all false (approved must be true)', () => {
    assert.equal(
      performanceReviewPassed({
        approved: false,
        newFact: false,
        solutionLeak: false,
        statementRewrite: false,
      }),
      false,
    );
  });
});

// ── Integration: full round-trip with quoteIds ────────────────────────────────

describe('validatePerformance — round-trip with quoteIds', () => {
  it('validates a two-line performance with mixed quoteIds', () => {
    const raw = {
      lines: [
        { speakerId: 's2', text: 'The lamp was off. Check the record.', quoteIds: ['st-3'] },
        { speakerId: 'kirock', text: 'An interesting point of view.', quoteIds: ['st-1', 'st-2'] },
      ],
    };
    const result = validatePerformance(raw, { ...BASE_INPUT, target: 's2' });
    assert.equal(result.lines[0].speakerId, 's2');
    assert.deepEqual(result.lines[0].quoteIds, ['st-3']);
    assert.equal(result.lines[1].speakerId, 'kirock');
    assert.deepEqual(result.lines[1].quoteIds, ['st-1', 'st-2']);
  });
});
