import { SUSPECT_IDS, type Claim, type Statement, type World } from "./types";

export function enumerateWorlds(): World[] {
  return SUSPECT_IDS.flatMap((culpritId) => [false, true].map((fact) => ({ culpritId, fact })));
}

export function evaluate(claim: Claim, world: World): boolean {
  switch (claim.type) {
    case "culprit_is": return world.culpritId === claim.suspectId;
    case "fact_is": return world.fact === claim.value;
    case "fact_or_culprit": return world.fact === claim.value || ((world.culpritId === claim.suspectId) !== claim.negated);
  }
}

export function fits(world: World, statements: readonly Statement[]): boolean {
  return statements.every((statement) =>
    evaluate(statement.claim, world) === (statement.speakerId !== world.culpritId),
  );
}

/** Removing a witness removes only their constraint; all six worlds remain possible. */
export function solve(statements: readonly Statement[]): World[] {
  return enumerateWorlds().filter((world) => fits(world, statements));
}

export function validatePuzzle(statements: readonly Statement[]): World {
  if (statements.length !== 3 || new Set(statements.map((s) => s.speakerId)).size !== 3) {
    throw new Error("A case needs exactly one statement from each of three suspects.");
  }
  const solutions = solve(statements);
  if (solutions.length !== 1) throw new Error("A case must have exactly one complete solution world.");
  for (let omitted = 0; omitted < statements.length; omitted++) {
    const remaining = statements.filter((_, index) => index !== omitted);
    const candidates = new Set(solve(remaining).map((world) => world.culpritId));
    if (candidates.size < 2) throw new Error("Every official statement must be necessary.");
  }
  return solutions[0];
}
