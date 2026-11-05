/**
 * tests/hypothesis.test.ts — Hypothesis builder tests.
 *
 * This test file is Kiro work (2026-10-31).
 * Uses node:test and node:assert/strict, matching the project's existing test style.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SUSPECT_IDS, type SuspectId, type Suspect } from "../src/lib/game/types";
import { buildHypotheses, type HypothesisId } from "../src/lib/game/hypothesis";

// ── Helpers ──────────────────────────────────────────────────────────────────

function permutations<T>(items: T[]): T[][] {
  if (items.length === 0) return [[]];
  return items.flatMap((item, index) =>
    permutations(items.filter((_, i) => i !== index)).map((tail) => [item, ...tail]),
  );
}

/** Minimal Suspect fixture — only fields used by buildHypotheses. */
function makeSuspect(id: SuspectId, displayName: string): Suspect {
  return {
    id,
    displayName,
    kind: "cup",
    face: { x: 0.5, y: 0.5, scale: 0.15, rotation: 0 },
    personalityId: "dry",
  };
}

const SAMPLE_SUSPECTS: readonly Suspect[] = [
  makeSuspect("s0", "머그컵"),
  makeSuspect("s1", "스탠드"),
  makeSuspect("s2", "키보드"),
];

const ALL_ORDERS = permutations([...SUSPECT_IDS]) as SuspectId[][];

// ── Tests ─────────────────────────────────────────────────────────────────────

test("all six permutations of suspect display order produce exactly six hypotheses", () => {
  for (const order of ALL_ORDERS) {
    const hypotheses = buildHypotheses(SAMPLE_SUSPECTS, order);
    assert.equal(hypotheses.length, 6, `order ${order.join(",")} → expected 6 hypotheses`);
  }
});

test("display order is respected: suspects appear in displayOrder sequence", () => {
  for (const order of ALL_ORDERS) {
    const hypotheses = buildHypotheses(SAMPLE_SUSPECTS, order);
    // Cards 0,1 belong to order[0]; cards 2,3 to order[1]; cards 4,5 to order[2].
    for (let i = 0; i < 3; i++) {
      const expected = order[i];
      assert.equal(
        hypotheses[i * 2].culpritId, expected,
        `pair ${i} (even): expected culpritId ${expected}`,
      );
      assert.equal(
        hypotheses[i * 2 + 1].culpritId, expected,
        `pair ${i} (odd): expected culpritId ${expected}`,
      );
    }
  }
});

test("within each suspect pair, fact=false appears before fact=true", () => {
  for (const order of ALL_ORDERS) {
    const hypotheses = buildHypotheses(SAMPLE_SUSPECTS, order);
    for (let i = 0; i < 3; i++) {
      assert.equal(hypotheses[i * 2].fact, false, `pair ${i} first card should have fact=false`);
      assert.equal(hypotheses[i * 2 + 1].fact, true, `pair ${i} second card should have fact=true`);
    }
  }
});

test("all six IDs are unique within a single call", () => {
  for (const order of ALL_ORDERS) {
    const hypotheses = buildHypotheses(SAMPLE_SUSPECTS, order);
    const ids = hypotheses.map((h) => h.id);
    const unique = new Set(ids);
    assert.equal(unique.size, 6, `order ${order.join(",")} produced duplicate IDs: ${ids.join(", ")}`);
  }
});

test("hypothesis IDs are stable: same culpritId+fact always yields the same id, regardless of display order", () => {
  // Collect (culpritId, fact) → id mapping from the first order.
  const first = buildHypotheses(SAMPLE_SUSPECTS, ["s0", "s1", "s2"]);
  const canonical = new Map<string, HypothesisId>();
  for (const h of first) {
    canonical.set(`${h.culpritId}-${h.fact}`, h.id);
  }

  // Every other display order must produce the same id for the same (culpritId, fact).
  for (const order of ALL_ORDERS) {
    const hypotheses = buildHypotheses(SAMPLE_SUSPECTS, order);
    for (const h of hypotheses) {
      const key = `${h.culpritId}-${h.fact}`;
      assert.equal(
        h.id,
        canonical.get(key),
        `ID mismatch for ${key} under order ${order.join(",")}`,
      );
    }
  }
});

test("ID format matches '<suspectId>-<fact>' template literal", () => {
  const hypotheses = buildHypotheses(SAMPLE_SUSPECTS, ["s0", "s1", "s2"]);
  for (const h of hypotheses) {
    const expected = `${h.culpritId}-${h.fact}` as HypothesisId;
    assert.equal(h.id, expected);
  }
});

test("suspectDisplayName is taken from the suspects array, not the display order entry alone", () => {
  const renamed: Suspect[] = [
    makeSuspect("s0", "Alpha"),
    makeSuspect("s1", "Beta"),
    makeSuspect("s2", "Gamma"),
  ];
  const hypotheses = buildHypotheses(renamed, ["s2", "s0", "s1"]);
  // Cards 0,1 → s2 → "Gamma"
  assert.equal(hypotheses[0].suspectDisplayName, "Gamma");
  assert.equal(hypotheses[1].suspectDisplayName, "Gamma");
  // Cards 2,3 → s0 → "Alpha"
  assert.equal(hypotheses[2].suspectDisplayName, "Alpha");
  assert.equal(hypotheses[3].suspectDisplayName, "Alpha");
  // Cards 4,5 → s1 → "Beta"
  assert.equal(hypotheses[4].suspectDisplayName, "Beta");
  assert.equal(hypotheses[5].suspectDisplayName, "Beta");
});

test("frozen input array is not mutated by buildHypotheses", () => {
  const order = Object.freeze(["s0", "s1", "s2"] as SuspectId[]) as readonly SuspectId[];
  // If the builder tried to sort/reverse/push the array this would throw in strict mode.
  assert.doesNotThrow(() => buildHypotheses(SAMPLE_SUSPECTS, order));
});

test("frozen Suspect objects are not mutated by buildHypotheses", () => {
  const frozen: readonly Suspect[] = Object.freeze(
    SAMPLE_SUSPECTS.map((s) => Object.freeze({ ...s, face: Object.freeze({ ...s.face }) })),
  ) as readonly Suspect[];
  assert.doesNotThrow(() => buildHypotheses(frozen, ["s0", "s1", "s2"]));
  // Confirm the original objects are unchanged (deep equality).
  for (let i = 0; i < SAMPLE_SUSPECTS.length; i++) {
    assert.deepEqual(frozen[i], SAMPLE_SUSPECTS[i]);
  }
});

test("returned array is independent of input — mutating result does not affect subsequent calls", () => {
  const order: SuspectId[] = ["s0", "s1", "s2"];
  const first = buildHypotheses(SAMPLE_SUSPECTS, order);
  // Mutate the returned array.
  first.splice(0, 6);
  assert.equal(first.length, 0);
  // A fresh call should still return six items.
  const second = buildHypotheses(SAMPLE_SUSPECTS, order);
  assert.equal(second.length, 6);
});

test("hypothesis.ts source does not import solver, validatePuzzle, or private answer modules", () => {
  const source = readFileSync(
    join(import.meta.dirname ?? process.cwd(), "../src/lib/game/hypothesis.ts"),
    "utf8",
  );
  // Confirm the file does not import the solver, generator, render, or server modules.
  const forbidden = ["solver", "validatePuzzle", "generator", "render", "server-only", "share-store"];
  for (const term of forbidden) {
    assert.ok(
      !source.includes(`"${term}"`) && !source.includes(`'${term}'`),
      `hypothesis.ts must not import "${term}"`,
    );
  }
});
