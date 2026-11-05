/**
 * hypothesis.ts — Manual six-world scratchpad builder.
 *
 * This module is Kiro work (2026-10-31). It has no dependency on DOM, React,
 * Next.js, AI, storage, solver, or private answer data.
 *
 * The inherited application (engine, renderer, generator, components) is Codex work.
 */

import type { Suspect, SuspectId } from "./types";

/** A stable identifier encoding culpritId and fact. Six legal values exist. */
export type HypothesisId = `${SuspectId}-false` | `${SuspectId}-true`;

/** One entry in the six-world Cartesian product used as a player scratchpad. */
export type Hypothesis = {
  /** Stable ID derived from culpritId and fact; suitable as a React key and data-testid suffix. */
  readonly id: HypothesisId;
  readonly culpritId: SuspectId;
  readonly fact: boolean;
  /** Display name from the matching Suspect, for rendering without a separate lookup. */
  readonly suspectDisplayName: string;
};

/**
 * Build the Cartesian product of suspects × {false, true} as an ordered array of six Hypothesis
 * objects. The suspects are emitted in the order given by `displayOrder`; within each suspect,
 * fact=false appears before fact=true.
 *
 * - Does NOT mutate `suspects` or `displayOrder`.
 * - Does NOT call the solver, read private answer data, or access any UI or storage layer.
 * - Returns a new array on every call; callers may mutate the result without affecting inputs.
 *
 * @param suspects     All Suspect objects for the current case (used for displayName lookup).
 * @param displayOrder The SuspectId ordering that controls card layout (matches publicSnapshot order).
 */
export function buildHypotheses(
  suspects: readonly Suspect[],
  displayOrder: readonly SuspectId[],
): Hypothesis[] {
  // Build a lookup map without mutating the input array.
  const nameById = new Map<SuspectId, string>();
  for (const suspect of suspects) {
    nameById.set(suspect.id, suspect.displayName);
  }

  const result: Hypothesis[] = [];
  for (const culpritId of displayOrder) {
    const suspectDisplayName = nameById.get(culpritId) ?? culpritId;
    result.push(
      {
        id: `${culpritId}-false` as HypothesisId,
        culpritId,
        fact: false,
        suspectDisplayName,
      },
      {
        id: `${culpritId}-true` as HypothesisId,
        culpritId,
        fact: true,
        suspectDisplayName,
      },
    );
  }
  return result;
}

