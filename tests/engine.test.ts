import test from "node:test";
import assert from "node:assert/strict";
import {
  SUSPECT_IDS, OBJECT_KINDS, PERSONALITY_IDS, characterLines, createCase, createVariant, enumerateWorlds, evaluate,
  explainCase, fits, publicSnapshot, renderClaim, resolveCase, sampleNames, sampleSuspects, solve,
  validateDraft, validatePuzzle,
  type CaseDraft, type Locale, type Statement, type StoryId, type SuspectId, type Triple,
} from "../src/lib/game/index";
import { SUPPORTED_LOCALES } from "../src/lib/i18n/locales";
import { nameOf } from "../src/lib/game/content";

function permutations<T>(items: T[]): T[][] {
  return items.length === 0 ? [[]] : items.flatMap((item, index) =>
    permutations(items.filter((_, other) => other !== index)).map((tail) => [item, ...tail]),
  );
}
const orders = permutations([...SUSPECT_IDS]) as Triple<SuspectId>[];
const clone = <T>(input: T): T => JSON.parse(JSON.stringify(input)) as T;

// Independent language anchors catch reversed polarity or accidental English fallback.
const factWords: Record<Locale, { coffee: [string, string]; sticker: [string, string] }> = {
  en: { coffee: ['was off', 'was on'], sticker: ['before midnight', 'after midnight'] },
  ko: { coffee: ['꺼져', '켜져'], sticker: ['자정 전', '자정 후'] },
  es: { coffee: ['apagada', 'encendida'], sticker: ['antes de medianoche', 'después de medianoche'] },
  fr: { coffee: ['éteinte', 'allumée'], sticker: ['avant minuit', 'après minuit'] },
  de: { coffee: [' aus.', ' an.'], sticker: ['vor Mitternacht', 'nach Mitternacht'] },
  pt: { coffee: ['apagada', 'acesa'], sticker: ['antes da meia-noite', 'depois da meia-noite'] },
  ja: { coffee: ['消えて', 'ついて'], sticker: ['午前0時より前', '午前0時より後'] },
  zh: { coffee: ['关着', '开着'], sticker: ['午夜之前', '午夜之后'] },
  ar: { coffee: ['مطفأ', 'مضاء'], sticker: ['قبل منتصف الليل', 'بعد منتصف الليل'] },
  hi: { coffee: ['बंद', 'चालू'], sticker: ['आधी रात से पहले', 'आधी रात के बाद'] },
};

test("all 144 approved variants: six worlds, one solution, all three testimonies necessary, proof and evidence agree in all ten languages", () => {
  let checked = 0;
  let renderedLocales = 0;
  for (const storyId of ["coffee", "sticker"] as StoryId[]) {
    for (const [a, b, c] of orders) {
      for (const factInverted of [false, true]) {
        for (const displayOrder of orders) {
          const draft = createVariant(sampleSuspects(), {
            storyId, roleAssignment: { a, b, c }, factInverted, displayOrder,
            ...(storyId === "coffee" ? { factSubjectId: "s1" as const } : {}),
          });
          assert.equal(enumerateWorlds().length, 6);
          const worlds = solve(draft.statements);
          assert.deepEqual(worlds, [{ culpritId: a, fact: factInverted }]);
          assert.deepEqual(validatePuzzle(draft.statements), worlds[0]);
          assert.equal(draft.statements.filter((statement) => !evaluate(statement.claim, worlds[0])).length, 1);
          for (const world of enumerateWorlds()) {
            assert.equal(fits(world, draft.statements), world.culpritId === a && world.fact === factInverted);
          }
          for (const omitted of draft.statements) {
            const others = draft.statements.filter((statement) => statement.id !== omitted.id);
            assert.ok(new Set(solve(others).map((world) => world.culpritId)).size >= 2);
          }
          for (const locale of SUPPORTED_LOCALES) {
            const proof = explainCase(draft, locale);
            assert.deepEqual(proof.world, worlds[0]);
            assert.equal(proof.proofSteps.length, 3);
            const culpritName = nameOf(draft, a, locale);
            assert.ok(proof.proofSteps[1].includes(culpritName));
            assert.ok(proof.proofSteps[2].includes(culpritName));
            assert.ok(proof.proofSteps[2].includes(factWords[locale][storyId][worlds[0].fact ? 1 : 0]), `${locale} proof state`);
            assert.ok(!proof.proofSteps[2].includes(factWords[locale][storyId][worlds[0].fact ? 0 : 1]), `${locale} proof must not reverse the state`);
            const snapshot = publicSnapshot(draft, locale);
            assert.equal(snapshot.locale, locale);
            assert.equal(new Set(snapshot.factLabels).size, 2);
            for (const statement of draft.statements) {
              const rendered = renderClaim(statement, draft, locale);
              assert.equal(snapshot.statements.find(s => s.id === statement.id)!.text, rendered);
              assert.doesNotMatch(rendered, /\{(?:target|first|second|third|culprit|fact)\}|undefined/);
              if (statement.claim.type === 'fact_is') {
                assert.ok(rendered.includes(factWords[locale][storyId][statement.claim.value ? 1 : 0]), `${locale} claim state`);
                assert.ok(!rendered.includes(factWords[locale][storyId][statement.claim.value ? 0 : 1]), `${locale} claim must not reverse the state`);
                if (storyId === 'coffee' && statement.speakerId !== draft.factSubjectId) {
                  assert.ok(rendered.includes(nameOf(draft, draft.factSubjectId!, locale)));
                }
              } else assert.ok(rendered.includes(nameOf(draft, statement.claim.suspectId, locale)));
            }
            for (const suspectId of SUSPECT_IDS) {
              const result = resolveCase(draft, suspectId, locale);
              assert.equal(result.correct, suspectId === a);
              assert.equal(result.culpritId, a);
              assert.equal(result.fact, factInverted);
              assert.deepEqual(result.proofSteps, proof.proofSteps);
              assert.ok(result.confession.length > 0);
            }
            renderedLocales++;
          }
          assert.deepEqual(validateDraft(JSON.parse(JSON.stringify(draft))), draft);
          checked++;
        }
      }
    }
  }
  assert.equal(checked, 144);
  assert.equal(renderedLocales, 1440);
});

test("lamp fact subject stays fixed through every role, name, and display shuffle", () => {
  const renamed = sampleSuspects();
  renamed.forEach(s => { delete s.sampleName; });
  renamed[0].displayName = "cup <script>alert(1)</script>";
  renamed[1].displayName = "Blue reading lamp";
  renamed[2].displayName = "Keyboard & friends";
  for (const [a, b, c] of orders) {
    const draft = createVariant([renamed[2], renamed[0], renamed[1]], {
      storyId: "coffee", roleAssignment: { a, b, c }, displayOrder: [c, a, b],
      factSubjectId: "s1", factInverted: false,
    });
    assert.equal(draft.factSubjectId, "s1");
    for (const statement of draft.statements.filter((s) => s.claim.type === "fact_is")) {
      const ko = renderClaim(statement, draft, "ko");
      const en = renderClaim(statement, draft, "en");
      if (statement.speakerId === "s1") {
        assert.ok(ko.includes("나는"));
        assert.ok(en.includes("I was"));
      } else {
        assert.ok(ko.includes("Blue reading lamp"));
        assert.ok(en.includes("Blue reading lamp"));
        assert.ok(!en.includes("I was"));
      }
    }
  }
});

test("generation is reproducible with seed and varies roles/order/state across seeds", () => {
  const first = createCase(sampleSuspects(), { seed: 12345 });
  assert.deepEqual(first, createCase(sampleSuspects(), { seed: 12345 }));
  const culprits = new Set<string>();
  const presentations = new Set<string>();
  const facts = new Set<boolean>();
  for (let seed = 0; seed < 200; seed++) {
    const draft = createCase(sampleSuspects(), { seed });
    culprits.add(solve(draft.statements)[0].culpritId);
    facts.add(solve(draft.statements)[0].fact);
    presentations.add(draft.displayOrder.join("/"));
  }
  assert.equal(culprits.size, 3);
  assert.equal(presentations.size, 6);
  assert.equal(facts.size, 2);
});

test("no lamp selects generic fictional story; forcing coffee without one fails", () => {
  const suspects = sampleSuspects();
  suspects[1].kind = "plant";
  delete suspects[1].sampleName;
  const generic = createCase(suspects, { seed: 1 });
  assert.equal(generic.storyId, "sticker");
  assert.equal(generic.factId, "bell-after-midnight");
  assert.equal(generic.factSubjectId, undefined);
  assert.throws(() => createCase(suspects, { storyId: "coffee" }), /lamp/);
});

test("public DTO contains only replay material and is independent of guilt before verdict", () => {
  const first = createVariant(sampleSuspects(), { storyId: "coffee", roleAssignment: { a: "s0", b: "s1", c: "s2" }, factInverted: false, displayOrder: ["s0", "s1", "s2"] });
  const other = createVariant(sampleSuspects(), { storyId: "coffee", roleAssignment: { a: "s1", b: "s2", c: "s0" }, factInverted: true, displayOrder: ["s0", "s1", "s2"] });
  for (const locale of SUPPORTED_LOCALES) {
    const snapshot = publicSnapshot(first, locale);
    assert.deepEqual(Object.keys(snapshot).sort(), ["characterLines", "context", "factLabels", "interrogations", "locale", "statements", "suspects", "title"]);
    snapshot.statements.forEach((statement) => assert.deepEqual(Object.keys(statement).sort(), ["id", "speakerId", "text"]));
    assert.deepEqual(snapshot.characterLines, publicSnapshot(other, locale).characterLines);
    assert.deepEqual(snapshot.suspects, publicSnapshot(other, locale).suspects);
    assert.ok(!/"(?:culpritId|confession|proofSteps|factInverted|roleAssignment|claim)"/.test(JSON.stringify(snapshot)));
    for (const suspect of first.suspects) assert.deepEqual(snapshot.characterLines[suspect.id], characterLines(suspect, locale));
    const stable = publicSnapshot(validateDraft(clone(first)), locale);
    assert.deepEqual(stable, snapshot);
  }
});

test("invalid templates are rejected: ambiguity, contradictions, redundant testimony", () => {
  const ambiguous: Statement[] = [
    { id: "1", speakerId: "s0", claim: { type: "culprit_is", suspectId: "s1" } },
    { id: "2", speakerId: "s1", claim: { type: "culprit_is", suspectId: "s0" } },
    { id: "3", speakerId: "s2", claim: { type: "culprit_is", suspectId: "s0" } },
  ];
  // The culprit is fixed, but both event states survive: not one complete world.
  assert.equal(solve(ambiguous).length, 2);
  assert.throws(() => validatePuzzle(ambiguous), /one complete/);
  const contradiction: Statement[] = SUSPECT_IDS.map((speakerId) => ({
    id: speakerId, speakerId, claim: { type: "culprit_is", suspectId: speakerId },
  }));
  assert.equal(solve(contradiction).length, 0);
  assert.throws(() => validatePuzzle(contradiction), /one complete/);
  const redundant: Statement[] = [
    { id: "1", speakerId: "s0", claim: { type: "fact_is", value: true } },
    { id: "2", speakerId: "s1", claim: { type: "fact_is", value: true } },
    { id: "3", speakerId: "s2", claim: { type: "fact_is", value: false } },
  ];
  assert.equal(solve(redundant).length, 1);
  assert.throws(() => validatePuzzle(redundant), /necessary/);
});

test("untrusted drafts reject tampered logic, hidden solution fields, unknown versions, and invalid coordinates", () => {
  const good = createCase(sampleSuspects(), { seed: 1 });
  const mutations: ((draft: CaseDraft & Record<string, unknown>) => void)[] = [
    (draft) => { draft.solution = "s0"; },
    (draft) => { draft.factLabels = { ko: "Injected event" }; },
    (draft) => { (draft as Record<string, unknown>).templateVersion = 999; },
    (draft) => { (draft as Record<string, unknown>).storyVersion = 999; },
    (draft) => { (draft as Record<string, unknown>).factId = "other-fact"; },
    (draft) => { draft.factSubjectId = "s0"; },
    (draft) => { draft.roleAssignment.b = draft.roleAssignment.a; },
    (draft) => { draft.displayOrder[0] = draft.displayOrder[1]; },
    (draft) => { draft.statements[0].claim = { type: "culprit_is", suspectId: "s0" }; draft.statements[1].claim = { type: "culprit_is", suspectId: "s0" }; },
    (draft) => { (draft.statements[0] as Statement & { text?: string }).text = "AI wrote this"; },
    (draft) => { draft.suspects[0].id = draft.suspects[1].id; },
    (draft) => { draft.suspects[0].displayName = draft.suspects[1].displayName; },
    (draft) => { draft.suspects[0].displayName = " "; },
    (draft) => { draft.suspects[0].kind = "unknown"; },
    (draft) => { (draft.suspects[0] as unknown as Record<string, unknown>).sampleName = "unknown"; },
    (draft) => { draft.suspects[0].personalityId = "guilty"; },
    (draft) => { draft.suspects[0].face.x = 1.01; },
    (draft) => { draft.suspects[0].face.y = -0.01; },
    (draft) => { draft.suspects[0].face.scale = 0.07; },
    (draft) => { draft.suspects[0].face.rotation = 181; },
    (draft) => { draft.suspects[0].face.x = Number.NaN; },
    (draft) => { (draft as Record<string, unknown>).locale = "zz"; },
  ];
  for (const mutate of mutations) {
    const tampered = clone(good) as CaseDraft & Record<string, unknown>;
    mutate(tampered);
    assert.throws(() => validateDraft(tampered));
  }
  assert.throws(() => validateDraft(null));
  assert.throws(() => validateDraft([]));
});

test("validated drafts and public snapshots are detached copies, preventing mutation through caller references", () => {
  const draft = createCase(sampleSuspects(), { seed: 5 });
  const expected = clone(draft);
  const validated = validateDraft(draft);
  validated.suspects[0].face.x = 0;
  assert.deepEqual(draft, expected);
  const snapshot = publicSnapshot(draft, "en");
  snapshot.suspects[0].face.y = 0;
  snapshot.characterLines.s0.push("modified");
  assert.deepEqual(draft, expected);
  assert.equal(publicSnapshot(draft, "en").characterLines.s0.length, 2);
});

test('ten static locales preserve sample identity, custom names, draft state, and English defaults', () => {
  const draft = createCase(sampleSuspects(), { seed: 5 });
  const before = clone(draft);
  assert.equal(draft.locale, 'en');
  assert.equal(sampleSuspects()[0].displayName, 'Mug');
  const titles = new Set<string>();
  const proofs = new Set<string>();
  for (const locale of SUPPORTED_LOCALES) {
    const snapshot = publicSnapshot(draft, locale);
    const names = sampleNames(locale);
    titles.add(snapshot.title);
    proofs.add(explainCase(draft, locale).proofSteps.join(' '));
    assert.equal(snapshot.suspects.find(s => s.id === 's1')!.displayName, names[1]);
    assert.ok(snapshot.context.includes(names[1]));
    assert.ok(snapshot.factLabels!.every(label => label.includes(names[1])));
    const localizedDraft = { ...clone(draft), locale };
    assert.deepEqual(validateDraft(localizedDraft), localizedDraft);
    assert.deepEqual(solve(localizedDraft.statements), solve(draft.statements));
    const custom = clone(draft);
    custom.suspects.forEach((s, i) => { delete s.sampleName; s.displayName = `Custom ${i} {target} <script>`; });
    const customSnapshot = publicSnapshot(custom, locale);
    assert.deepEqual(customSnapshot.suspects.map(s => s.displayName).sort(), custom.suspects.map(s => s.displayName).sort());
    assert.ok(customSnapshot.context.includes(custom.suspects[1].displayName));
    for (const statement of custom.statements) {
      if (statement.claim.type === 'culprit_is') assert.ok(renderClaim(statement, custom, locale).includes(nameOf(custom, statement.claim.suspectId)));
    }
    assert.deepEqual(draft, before);
    const namesAgain = sampleNames(locale);
    names[0] = 'caller mutation';
    assert.notEqual(namesAgain[0], names[0]);
  }
  assert.equal(titles.size, 10);
  assert.equal(proofs.size, 10);
  assert.throws(() => createVariant(draft.suspects, { storyId: 'coffee', roleAssignment: draft.roleAssignment, factInverted: false, displayOrder: draft.displayOrder, locale: 'zz' as Locale }));
  assert.throws(() => renderClaim(draft.statements[0], draft, 'zz' as Locale));
  assert.throws(() => publicSnapshot(draft, 'zz' as Locale));
  const bad = clone(draft);
  bad.suspects[0].sampleName = 'lamp';
  assert.throws(() => validateDraft(bad), /Sample name/);
});

test('every object kind and personality has authored nonempty copy in all ten locales', () => {
  for (const kind of OBJECT_KINDS) for (const personalityId of PERSONALITY_IDS) {
    const copies = new Set<string>();
    for (const locale of SUPPORTED_LOCALES) {
      const suspect = { ...sampleSuspects()[0], kind, personalityId };
      const lines = characterLines(suspect, locale);
      assert.equal(lines.length, 2);
      assert.ok(lines.every(line => typeof line === 'string' && line.trim().length > 5));
      assert.doesNotMatch(lines.join(' '), /undefined|\{(?:target|speaker|subject)\}/);
      copies.add(lines.join(' '));
    }
    assert.equal(copies.size, 10, `${kind}/${personalityId} must not fall back to English`);
  }
});
