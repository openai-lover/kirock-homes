import test from "node:test";
import { SUPPORTED_LOCALES } from "../src/lib/i18n/locales";
import assert from "node:assert/strict";
import { createVariant } from "../src/lib/game/generator";
import { renderClaim } from "../src/lib/game/render";
import { solve } from "../src/lib/game/solver";
import { renderInterrogations, INTERROGATION_VERSION } from "../src/lib/game/interrogation";
import { OBJECT_KINDS, SUSPECT_IDS, type CaseDraft, type Locale, type PublicStatement, type StoryId, type Suspect, type SuspectId, type Triple } from "../src/lib/game/types";

function permutations<T>(items: T[]): T[][] {
  return items.length === 0 ? [[]] : items.flatMap((item, index) =>
    permutations(items.filter((_, other) => index !== other)).map(tail => [item, ...tail]));
}
const orders = permutations([...SUSPECT_IDS]) as Triple<SuspectId>[];
const suspects: Suspect[] = [
  { id: "s0", displayName: "작은 컵 / Cup", kind: "cup", personalityId: "dramatic", face: { x: .2, y: .4, scale: .15, rotation: -4 } },
  { id: "s1", displayName: "파란 조명 / Blue lamp", kind: "lamp", personalityId: "dry", face: { x: .7, y: .2, scale: .16, rotation: 3 } },
  { id: "s2", displayName: "낡은 책 / Book", kind: "book", personalityId: "cheerful", face: { x: .5, y: .8, scale: .18, rotation: 0 } },
];
function official(draft: CaseDraft, locale: Locale): PublicStatement[] {
  return draft.statements.map(statement => ({ id: statement.id, speakerId: statement.speakerId, text: renderClaim(statement, draft, locale) }));
}
function variant(storyId: StoryId, roles: Triple<SuspectId> = ["s0", "s1", "s2"], factInverted = false, displayOrder: Triple<SuspectId> = ["s0", "s1", "s2"]): CaseDraft {
  const [a, b, c] = roles;
  return createVariant(suspects, { storyId, roleAssignment: { a, b, c }, factInverted, displayOrder,
    ...(storyId === "coffee" ? { factSubjectId: "s1" as const } : {}) });
}

test("interrogations cover all 144 variants × ten languages with exact citations, fixed referents, and three unchanged statements", () => {
  let checked = 0;
  let renderedLocales = 0;
  for (const storyId of ["coffee", "sticker"] as StoryId[]) {
    for (const roles of orders) for (const inverted of [false, true]) for (const order of orders) {
      const draft = variant(storyId, roles, inverted, order);
      const before = JSON.stringify(draft);
      const solution = solve(draft.statements);
      for (const locale of SUPPORTED_LOCALES) {
        const statements = official(draft, locale);
        const routes = renderInterrogations(draft, locale, statements);
        assert.deepEqual(Object.keys(routes), [...SUSPECT_IDS]);
        assert.equal(new Set(Object.values(routes).map(route => route.question)).size, 3);
        for (const speakerId of SUSPECT_IDS) {
          const route = routes[speakerId];
          const own = draft.statements.find(statement => statement.speakerId === speakerId)!;
          const ownPublic = statements.find(statement => statement.id === own.id)!;
          const reply = draft.statements.find(statement => statement.speakerId === route.rebuttalSpeakerId)!;
          const replyPublic = statements.find(statement => statement.id === reply.id)!;
          assert.equal(route.version, INTERROGATION_VERSION);
          assert.equal(route.speakerId, speakerId);
          assert.notEqual(route.rebuttalSpeakerId, speakerId);
          assert.deepEqual(route.citedStatementIds, [own.id, reply.id]);
          // Quoted official sentences are never reworded into new testimony.
          assert.ok(route.challenge.endsWith(`“${ownPublic.text}”`));
          assert.ok(route.rebuttal.endsWith(`“${replyPublic.text}”`));
          assert.ok(route.question.includes(suspects.find(s => s.id === speakerId)!.displayName));
          assert.ok(route.rebuttal.includes(suspects.find(s => s.id === speakerId)!.displayName));
          if (own.claim.type === "fact_is") {
            assert.equal(reply.claim.type, "fact_is");
            if (reply.claim.type === "fact_is") assert.notEqual(reply.claim.value, own.claim.value);
            if (storyId === "coffee") {
              assert.ok(route.note.includes(suspects[1].displayName));
              // The subject is always the actual selected lamp, regardless of logical role.
              for (const other of [suspects[0].displayName, suspects[2].displayName]) assert.ok(!route.note.includes(other));
            } else {
              assert.ok(route.note.includes(({ ko: "종", en: "bell", es: "campana", fr: "cloche", de: "Glocke", pt: "sino", ja: "鐘", zh: "钟", ar: "الجرس", hi: "घंटी" })[locale]));
              assert.ok(!route.note.includes(suspects[1].displayName));
            }
          } else {
            const targetId = own.claim.suspectId;
            assert.equal(route.rebuttalSpeakerId, targetId);
            assert.ok(route.question.includes(suspects.find(s => s.id === targetId)!.displayName));
          }
          for (const field of [route.question, route.challenge, route.rebuttal, route.note]) assert.ok(field.trim().length > 15);
          assert.doesNotMatch(JSON.stringify(route), /undefined|\{(?:speaker|subject|other|target)\}/);
        }
        renderedLocales++;
      }
      assert.equal(JSON.stringify(draft), before);
      assert.equal(draft.statements.length, 3);
      assert.deepEqual(solve(draft.statements), solution);
      checked++;
    }
  }
  assert.equal(checked, 144);
  assert.equal(renderedLocales, 1440);
});

test("public interrogation fields carry no solution metadata and scaffolding never announces a verdict", () => {
  const forbiddenFields = new Set(["culpritId", "accusedId", "correct", "answer", "solution", "world", "fact", "factInverted", "roleAssignment", "proofSteps", "confession"]);
  for (const storyId of ["coffee", "sticker"] as StoryId[]) {
    for (const roles of orders) for (const inverted of [false, true]) {
      const draft = variant(storyId, roles, inverted);
      for (const locale of SUPPORTED_LOCALES) {
        const statements = official(draft, locale);
        const routes = renderInterrogations(draft, locale, statements);
        for (const route of Object.values(routes)) {
          assert.deepEqual(Object.keys(route).sort(), ["version", "speakerId", "question", "challenge", "rebuttalSpeakerId", "rebuttal", "note", "citedStatementIds"].sort());
          for (const field of Object.keys(route)) assert.ok(!forbiddenFields.has(field));
          const quote = statements.find(s => s.id === route.citedStatementIds[0])!.text;
          const replyQuote = statements.find(s => s.id === route.citedStatementIds[1])!.text;
          const scaffolding = [route.question, route.challenge.replace(quote, ""), route.rebuttal.replace(replyQuote, ""), route.note].join(" ");
          // The pre-existing direct accusation is intentionally present only as its unchanged quote.
          assert.doesNotMatch(scaffolding, /(?:is guilty|is innocent|is the culprit|the culprit is|is telling the truth|범인은 .+예요|범인은 .+야|네가 범인|내가 범인|무고해|거짓말했어)/i);
        }
      }
    }
  }
});

test("dialogue is derived from existing evidence, not private role/state metadata, personalities, or layout", () => {
  const draft = variant("coffee");
  for (const locale of SUPPORTED_LOCALES) {
    const statements = official(draft, locale);
    const expected = renderInterrogations(draft, locale, statements);
    const changed = structuredClone(draft);
    // Deliberately inconsistent private metadata tests a data-dependency boundary,
    // not draft validation; production must still validateDraft before rendering.
    changed.roleAssignment = { a: "s2", b: "s0", c: "s1" };
    changed.factInverted = !changed.factInverted;
    changed.displayOrder = ["s2", "s1", "s0"];
    changed.statements.reverse();
    changed.suspects.reverse();
    changed.suspects.forEach(s => { s.personalityId = "sleepy"; s.face = { x: .1, y: .1, scale: .1, rotation: 0 }; });
    assert.deepEqual(renderInterrogations(changed, locale, [...statements].reverse()), expected);
  }
});

test("all ten languages use the same witness links and citations, and survive snapshot serialization", () => {
  const draft = variant("sticker", ["s2", "s0", "s1"], true, ["s1", "s0", "s2"]);
  const en = renderInterrogations(draft, "en", official(draft, "en"));
  const serialized = [];
  for (const locale of SUPPORTED_LOCALES) {
    const routes = renderInterrogations(draft, locale, official(draft, locale));
    for (const id of SUSPECT_IDS) {
      assert.equal(routes[id].speakerId, en[id].speakerId);
      assert.equal(routes[id].rebuttalSpeakerId, en[id].rebuttalSpeakerId);
      assert.deepEqual(routes[id].citedStatementIds, en[id].citedStatementIds);
      if (locale !== 'en') assert.notEqual(routes[id].question, en[id].question);
    }
    assert.deepEqual(JSON.parse(JSON.stringify(routes)), routes);
    serialized.push(JSON.stringify(routes));
  }
  assert.equal(new Set(serialized).size, 10);
  const fresh = renderInterrogations(draft, "en", official(draft, "en"));
  en.s0.note = "a local caller's mutation";
  assert.notEqual(fresh.s0.note, en.s0.note);
});

test("missing, duplicate, misattributed, and empty official citations are rejected", () => {
  const draft = variant("coffee");
  const statements = official(draft, "en");
  assert.throws(() => renderInterrogations(draft, "en", statements.slice(0, 2)));
  assert.throws(() => renderInterrogations(draft, "en", [statements[0], statements[0], statements[2]]));
  const wrongSpeaker = structuredClone(statements);
  wrongSpeaker[0].speakerId = wrongSpeaker[1].speakerId;
  assert.throws(() => renderInterrogations(draft, "en", wrongSpeaker));
  const blank = structuredClone(statements);
  blank[0].text = " ";
  assert.throws(() => renderInterrogations(draft, "en", blank));
  assert.throws(() => renderInterrogations(draft, "zz" as Locale, statements));
});

test("each object kind has its own voice, attributed to the actual speaker without changing evidence", () => {
  for (const locale of SUPPORTED_LOCALES) {
    const base = variant("sticker");
    const statements = official(base, locale);
    const baseline = renderInterrogations(base, locale, statements);
    const challenges = new Set<string>();
    const rebuttals = new Set<string>();
    for (const kind of OBJECT_KINDS) {
      const draft = structuredClone(base);
      draft.suspects.find(s => s.id === "s0")!.kind = kind;
      const routes = renderInterrogations(draft, locale, statements);
      challenges.add(routes.s0.challenge);
      // s1's opposing-fact rebuttal is spoken by s0, whose kind we changed.
      assert.equal(routes.s1.rebuttalSpeakerId, "s0");
      rebuttals.add(routes.s1.rebuttal);
      for (const id of SUSPECT_IDS) {
        const route = routes[id];
        assert.equal(route.question, baseline[id].question);
        assert.equal(route.note, baseline[id].note);
        assert.deepEqual(route.citedStatementIds, baseline[id].citedStatementIds);
        assert.ok(route.challenge.endsWith(`“${statements.find(s => s.id === route.citedStatementIds[0])!.text}”`));
        assert.ok(route.rebuttal.endsWith(`“${statements.find(s => s.id === route.citedStatementIds[1])!.text}”`));
        if (id !== "s0") assert.equal(route.challenge, baseline[id].challenge);
        if (route.rebuttalSpeakerId !== "s0") assert.equal(route.rebuttal, baseline[id].rebuttal);
      }
      if ((locale === "en" || locale === "ko") && kind === "cup") assert.match(routes.s1.rebuttal, locale === "ko" ? /한 모금/ : /a sip/);
      if ((locale === "en" || locale === "ko") && kind === "lamp") assert.match(routes.s1.rebuttal, locale === "ko" ? /조명/ : /a little light/);
      if ((locale === "en" || locale === "ko") && kind === "electronics") assert.match(routes.s1.rebuttal, locale === "ko" ? /백스페이스/ : /backspace/);
      assert.deepEqual(draft.statements, base.statements);
      assert.deepEqual(solve(draft.statements), solve(base.statements));
    }
    assert.equal(challenges.size, OBJECT_KINDS.length);
    assert.equal(rebuttals.size, OBJECT_KINDS.length);
  }
});
