import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import { createCase, publicSnapshot, resolveCase, type Suspect } from "../src/lib/game";
import { SqliteShareStore, newToken, SHARE_LIFETIME_MS } from "../src/lib/server/share-store";
import { sanitizeImage } from "../src/lib/server/image";
import { failure, json, readJson, readLocale, sameOrigin, setPrivateCookie } from "../src/lib/server/http";
import { isServiceError, ServiceError } from "../src/lib/server/errors";
import { NextRequest } from "next/server";
import { DatabaseSync } from "node:sqlite";
import { SUPPORTED_LOCALES, type Locale } from "../src/lib/i18n/locales";

const suspects: Suspect[] = [
  { id: "s0", displayName: "SECRET_PRIVATE_CUP_8923", kind: "cup", face: { x: .2, y: .4, scale: .15, rotation: 0 }, personalityId: "dry" },
  { id: "s1", displayName: "Lamp", kind: "lamp", face: { x: .5, y: .3, scale: .16, rotation: 0 }, personalityId: "dramatic" },
  { id: "s2", displayName: "Keyboard", kind: "electronics", face: { x: .7, y: .7, scale: .18, rotation: 0 }, personalityId: "sleepy" },
];
const draft = createCase(suspects, { seed: 13 });
const image = { bytes: Buffer.from("unique-test-image-875235"), width: 400, height: 300, contentType: "image/jpeg" as const };
function throwsCode(action: () => unknown, code: string) { assert.throws(action, (error: unknown) => !!error && typeof error === "object" && "code" in error && error.code === code); }

test("service errors preserve status across isolated Next route/instrumentation class copies", async () => {
  // This deliberately distinct constructor reproduces a separately bundled
  // errors module sharing only the process-wide Symbol.for registry.
  const otherBundleTag = Symbol.for("room-of-suspects.service-error.v1");
  class OtherBundleServiceError extends Error {
    readonly [otherBundleTag] = true;
    constructor(public status: number, public code: string) { super(code); }
  }
  for (const [status, code] of [[403, "owner_required"], [404, "not_found"], [410, "expired"], [429, "ai_budget_reached"]] as const) {
    const error = new OtherBundleServiceError(status, code);
    assert.equal(error instanceof ServiceError, false);
    assert.equal(isServiceError(error), true);
    const response = failure(error);
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error: code });
  }
  assert.equal(isServiceError({ status: 403, code: "owner_required" }), false);
  assert.equal(isServiceError({ [Symbol.for("room-of-suspects.service-error.v1")]: true, status: 200, code: "unsafe" }), false);
  assert.equal(failure(new Error("private internal failure")).status, 500);
});

test("shared snapshots freeze all ten languages, dialogue, image and answer without public spoilers", () => {
  const store = new SqliteShareStore(":memory:"), owner = newToken();
  try {
    const { id } = store.create(draft, image, owner);
    for (const locale of SUPPORTED_LOCALES) {
      const snapshot = store.getPublic(id, locale), expected = publicSnapshot(draft, locale);
      assert.equal(snapshot.isOwner, false);
      assert.deepEqual(snapshot.statements, expected.statements);
      assert.deepEqual(snapshot.characterLines, expected.characterLines);
      assert.deepEqual(snapshot.interrogations, expected.interrogations);
      assert.deepEqual(snapshot.factLabels, expected.factLabels);
      assert.deepEqual(snapshot.suspects, expected.suspects);
      assert.equal(snapshot.locale, locale);
      assert.equal(snapshot.id, id);
      assert.deepEqual(snapshot.availableLocales, SUPPORTED_LOCALES);
      const serialized = JSON.stringify(snapshot);
      for (const forbidden of ["culpritId", "accusedId", "roleAssignment", "factInverted", "factSubjectId", "claim", "proofSteps", "confession", "private_json"]) assert.equal(serialized.includes(`"${forbidden}"`), false, forbidden);
      assert.equal(serialized.includes(resolveCase(draft, "s0", locale).confession), false);
    }
    assert.equal(store.getPublic(id, "ko", owner).isOwner, true);
    assert.deepEqual(store.getImage(id).bytes, image.bytes);
    const token = newToken(), play = store.startPlay(id, token);
    assert.deepEqual(store.accuse(play.playId, token, "s0", "ko"), resolveCase(draft, "s0", "ko"));
    // Changing browser language never changes the already recorded accusation.
    for (const locale of SUPPORTED_LOCALES) {
      assert.deepEqual(store.accuse(play.playId, token, "s1", locale), resolveCase(draft, "s0", locale));
    }
  } finally { store.close(); }
});

test("owner and play authorization are separate; independent friends and repeated accusations", () => {
  const store = new SqliteShareStore(":memory:"), owner = newToken(), friend = newToken(), other = newToken();
  try {
    const { id } = store.create(draft, image, owner), first = store.startPlay(id, friend), second = store.startPlay(id, other);
    throwsCode(() => store.delete(id, friend), "owner_required");
    throwsCode(() => store.accuse(first.playId, owner, "s0", "ko"), "play_forbidden");
    throwsCode(() => store.accuse(first.playId, other, "s0", "ko"), "play_forbidden");
    const result = store.accuse(first.playId, friend, "s0", "ko");
    for (let i = 0; i < 10; i++) assert.deepEqual(store.accuse(first.playId, friend, "s2", "ko"), result);
    assert.equal(store.accuse(second.playId, other, "s2", "ko").accusedId, "s2");
    store.delete(id, owner);
    throwsCode(() => store.getPublic(id, "ko"), "not_found");
    throwsCode(() => store.getImage(id), "not_found");
    throwsCode(() => store.accuse(first.playId, friend, "s0", "ko"), "not_found");
  } finally { store.close(); }
});

test("legacy frozen shares keep their original dialogue without regenerated interrogation", () => {
  const directory = mkdtempSync(join(tmpdir(), 'room-legacy-share-'));
  const path = join(directory, 'case.sqlite');
  const store = new SqliteShareStore(path);
  try {
    const { id } = store.create(draft, image, newToken());
    const db = new DatabaseSync(path);
    try {
      const row = db.prepare('SELECT private_json FROM shared_cases WHERE id=?').get(id) as { private_json: string };
      const frozen = JSON.parse(row.private_json);
      for (const locale of SUPPORTED_LOCALES.filter(locale => locale !== 'en' && locale !== 'ko')) {
        delete frozen.snapshots[locale];
        delete frozen.results[locale];
      }
      for (const locale of ['ko', 'en']) {
        delete frozen.snapshots[locale].interrogations;
        delete frozen.snapshots[locale].factLabels;
      }
      db.prepare('UPDATE shared_cases SET private_json=? WHERE id=?').run(JSON.stringify(frozen), id);
    } finally { db.close(); }
    for (const locale of ['ko', 'en'] as const) {
      const snapshot = store.getPublic(id, locale);
      assert.equal('interrogations' in snapshot, false);
      assert.equal('factLabels' in snapshot, false);
      assert.deepEqual(snapshot.characterLines, publicSnapshot(draft, locale).characterLines);
      assert.deepEqual(snapshot.statements, publicSnapshot(draft, locale).statements);
    }
    const token = newToken(), { playId } = store.startPlay(id, token);
    assert.deepEqual(store.accuse(playId, token, 's0', 'ko'), resolveCase(draft, 's0', 'ko'));
    for (const locale of SUPPORTED_LOCALES.filter(locale => locale !== 'en' && locale !== 'ko')) {
      const fallback = store.getPublic(id, locale);
      assert.equal(fallback.locale, 'en');
      assert.deepEqual(fallback.availableLocales, ['en', 'ko']);
      assert.deepEqual(fallback.statements, publicSnapshot(draft, 'en').statements);
      assert.equal('interrogations' in fallback, false);
      assert.deepEqual(store.accuse(playId, token, 's2', locale), resolveCase(draft, 's0', 'en'));
    }
    const verificationDb = new DatabaseSync(path);
    try {
      const saved = JSON.parse((verificationDb.prepare('SELECT private_json FROM shared_cases WHERE id=?').get(id) as { private_json: string }).private_json);
      assert.deepEqual(Object.keys(saved.snapshots).sort(), ['en', 'ko']);
    } finally { verificationDb.close(); }
  } finally { store.close(); rmSync(directory, { recursive: true, force: true }); }
});

test("SQLite survives restart and removes private row, image and play records on deletion", () => {
  const dir = mkdtempSync(join(tmpdir(), "room-server-")), path = join(dir, "db.sqlite"), owner = newToken(), token = newToken();
  let store = new SqliteShareStore(path);
  try {
    const { id } = store.create(draft, image, owner), { playId } = store.startPlay(id, token);
    const first = store.accuse(playId, token, "s1", "ko");
    store.close(); store = new SqliteShareStore(path);
    assert.deepEqual(store.accuse(playId, token, "s0", "ko"), first);
    assert.equal(store.getPublic(id, "ko", owner).isOwner, true);
    assert.equal(readFileSync(path).includes(Buffer.from(suspects[0].displayName)), true);
    store.delete(id, owner);
    assert.equal(readFileSync(path).includes(Buffer.from(suspects[0].displayName)), false);
    assert.equal(readFileSync(path).includes(image.bytes), false);
    throwsCode(() => store.getPublic(id, "ko"), "not_found");
  } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

test("two independent Node processes racing different accusations commit the same first result", async () => {
  const dir = mkdtempSync(join(tmpdir(), "room-race-")), path = join(dir, "db.sqlite"), owner = newToken(), token = newToken();
  const store = new SqliteShareStore(path), run = promisify(execFile);
  try {
    const { id } = store.create(draft, image, owner), { playId } = store.startPlay(id, token);
    const script = `const {SqliteShareStore}=require('./src/lib/server/share-store.ts');const store=new SqliteShareStore(process.argv[1]);try{process.stdout.write(JSON.stringify(store.accuse(process.argv[2],process.argv[3],process.argv[4],'ko')))}finally{store.close()}`;
    const outcomes = await Promise.all(["s0", "s2"].map(accused => run(process.execPath, ["--import", "tsx", "--conditions=react-server", "-e", script, path, playId, token, accused], { cwd: process.cwd(), timeout: 10_000 })));
    const answers = outcomes.map(outcome => JSON.parse(outcome.stdout));
    assert.deepEqual(answers[0], answers[1]);
    assert.deepEqual(store.accuse(playId, token, "s1", "ko"), answers[0]);
  } finally { store.close(); rmSync(dir, { recursive: true, force: true }); }
});

test("strict expiry blocks new public/image/play/reveal access; cleanup deletes all expired data", () => {
  let now = 1_800_000_000_000;
  const store = new SqliteShareStore(":memory:", () => now), owner = newToken(), token = newToken();
  try {
    const one = store.create(draft, image, owner), two = store.create(draft, image, owner), three = store.create(draft, image, owner), four = store.create(draft, image, owner);
    const p = store.startPlay(four.id, token);
    assert.equal(Date.parse(one.expiresAt), now + SHARE_LIFETIME_MS);
    now += SHARE_LIFETIME_MS;
    throwsCode(() => store.getPublic(one.id, "ko"), "expired");
    throwsCode(() => store.getImage(two.id), "expired");
    throwsCode(() => store.startPlay(three.id, token), "expired");
    throwsCode(() => store.accuse(p.playId, token, "s0", "ko"), "expired");
    assert.deepEqual(store.cleanup(), { cases: 1, plays: 1, aiRequests: 0 });
    throwsCode(() => store.getImage(four.id), "not_found");
  } finally { store.close(); }
});

test("server refuses caller-supplied claims and additional solution fields", () => {
  const store = new SqliteShareStore(":memory:");
  try {
    assert.throws(() => store.create({ ...draft, culpritId: "s1" }, image, newToken()));
    const changed = structuredClone(draft);
    const original = changed.statements[0].claim;
    changed.statements[0].claim = original.type === "fact_is" ? { type: "fact_is", value: !original.value } : { type: "culprit_is", suspectId: original.suspectId === "s0" ? "s1" : "s0" };
    assert.throws(() => store.create(changed, image, newToken()));
  } finally { store.close(); }
});

test("persistent AI budgets and request deduplication prevent additional chargeable calls", () => {
  let now = 1_800_000_000_000;
  const store = new SqliteShareStore(":memory:", () => now);
  try {
    assert.deepEqual(store.beginAnalysis("r1", "image1", 1, 2), {});
    assert.deepEqual(store.beginAnalysis("r1", "image1", 1, 2), { pending: true });
    const result = { status: "manual", reason: "timeout", candidates: [] };
    store.finishAnalysis("r1", result);
    assert.deepEqual(store.beginAnalysis("r1", "image1", 1, 2), { cached: result });
    throwsCode(() => store.beginAnalysis("r1", "different-image", 1, 2), "request_id_reused");
    throwsCode(() => store.beginAnalysis("r2", "image2", 1, 2), "ai_budget_reached");
    now += 24 * 60 * 60 * 1000;
    assert.deepEqual(store.beginAnalysis("r2", "image2", 1, 2), {});
    now += 24 * 60 * 60 * 1000;
    throwsCode(() => store.beginAnalysis("r3", "image3", 1, 2), "ai_budget_reached");
  } finally { store.close(); }
});

test("one image cannot cause more than two provider calls during its 15-minute request window", () => {
  const store = new SqliteShareStore(":memory:");
  try {
    store.beginAnalysis("first", "same-image", 20, 100);
    store.beginAnalysis("second", "same-image", 20, 100);
    throwsCode(() => store.beginAnalysis("third", "same-image", 20, 100), "ai_budget_reached");
  } finally { store.close(); }
});

test("image decoder rejects corrupt/unsupported/oversize uploads and strips orientation metadata", async () => {
  await assert.rejects(sanitizeImage("data:image/jpeg;base64,bm90LWltYWdl"));
  await assert.rejects(sanitizeImage("data:image/svg+xml;base64,PHN2Zy8+"));
  await assert.rejects(sanitizeImage(`data:image/jpeg;base64,${"A".repeat(1_400_000)}`));
  for (const [width, height, orientation, expected] of [[600, 300, 1, [600, 300]], [300, 600, 1, [300, 600]], [600, 300, 6, [300, 600]]] as const) {
    const source = await sharp({ create: { width, height, channels: 3, background: "#cc7722" } }).jpeg().withMetadata({ orientation }).toBuffer();
    const sanitized = await sanitizeImage(`data:image/jpeg;base64,${source.toString("base64")}`);
    assert.deepEqual([sanitized.width, sanitized.height], expected);
    const metadata = await sharp(sanitized.bytes).metadata();
    assert.equal(metadata.exif, undefined);
    assert.equal(metadata.orientation, undefined);
    assert.equal(metadata.icc, undefined);
  }
});

test("same-origin mutations, bounded request bodies and supported locales are enforced", async () => {
  assert.throws(() => sameOrigin(new Request("http://localhost:3000/api/x", { headers: { Origin: "https://evil.example" } })));
  assert.throws(() => sameOrigin(new Request("http://localhost:3000/api/x")));
  assert.doesNotThrow(() => sameOrigin(new Request("http://localhost:3000/api/x", { headers: { Origin: "http://localhost:3000" } })));
  assert.doesNotThrow(() => sameOrigin(new Request("http://localhost:3000/api/x", { headers: { Origin: "http://127.0.0.1:3000", Host: "127.0.0.1:3000", "Sec-Fetch-Site": "same-origin" } })));
  assert.throws(() => sameOrigin(new Request("http://localhost:3000/api/x", { headers: { Origin: "https://evil.example", Host: "127.0.0.1:3000", "X-Forwarded-Host": "evil.example" } })));
  assert.throws(() => readLocale("zz"));
  assert.equal(readLocale(undefined), 'en');
  assert.equal(readLocale(null), 'en');
  for (const locale of SUPPORTED_LOCALES) assert.equal(readLocale(locale), locale);
  assert.deepEqual(await readJson(new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"consent":true}' })), { consent: true });
  await assert.rejects(readJson(new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tooLong: "x".repeat(100) }) }), 30));
});

test("configured HTTPS reverse proxy origin requires HTTPS and issues Secure owner cookies", () => {
  const previous = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = "https://room.example";
  try {
    const request = new NextRequest("http://127.0.0.1:3000/api/shared-cases", { headers: { Origin: "https://room.example", Host: "127.0.0.1:3000" } });
    assert.doesNotThrow(() => sameOrigin(request));
    assert.throws(() => sameOrigin(new Request("http://127.0.0.1:3000/api/x", { headers: { Origin: "http://room.example" } })));
    const response = json({ ok: true }); setPrivateCookie(response, request, "ros_owner", newToken());
    assert.match(response.headers.get("set-cookie")!, /Secure/);
  } finally { if (previous === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = previous; }
});

test("Node startup instrumentation starts hourly cleanup and physically removes downtime-expired rows", async () => {
  const dir = mkdtempSync(join(tmpdir(), "room-startup-")), path = join(dir, "startup.sqlite");
  const previousPath = process.env.SHARE_DB_PATH, previousRuntime = process.env.NEXT_RUNTIME;
  const globalState = globalThis as typeof globalThis & { __roomShareStore?: SqliteShareStore; __roomCleanupTimer?: ReturnType<typeof setInterval> };
  const originalInfo = console.info, logs: string[] = [];
  const seeded = new SqliteShareStore(path, () => Date.now() - SHARE_LIFETIME_MS - 1000);
  const { id } = seeded.create(draft, image, newToken()); seeded.startPlay(id, newToken()); seeded.close();
  process.env.SHARE_DB_PATH = path; process.env.NEXT_RUNTIME = "nodejs";
  try {
    assert.equal(readFileSync(path).includes(image.bytes), true);
    console.info = (...args: unknown[]) => { logs.push(args.map(String).join(" ")); };
    const { register } = await import("../src/instrumentation");
    await register();
    assert.ok(globalState.__roomCleanupTimer);
    assert.ok(globalState.__roomShareStore);
    throwsCode(() => globalState.__roomShareStore!.getPublic(id, "ko"), "not_found");
    assert.equal(readFileSync(path).includes(image.bytes), false);
    assert.equal(readFileSync(path).includes(Buffer.from(suspects[0].displayName)), false);
    const log = JSON.parse(logs[0]);
    assert.deepEqual({ cases: log.cases, plays: log.plays, status: log.status }, { cases: 1, plays: 1, status: "ok" });
    assert.equal(logs.join(" ").includes(suspects[0].displayName), false);
    assert.equal(logs.join(" ").includes(id), false);
  } finally {
    console.info = originalInfo;
    if (globalState.__roomCleanupTimer) clearInterval(globalState.__roomCleanupTimer);
    globalState.__roomShareStore?.close(); delete globalState.__roomShareStore; delete globalState.__roomCleanupTimer;
    if (previousPath === undefined) delete process.env.SHARE_DB_PATH; else process.env.SHARE_DB_PATH = previousPath;
    if (previousRuntime === undefined) delete process.env.NEXT_RUNTIME; else process.env.NEXT_RUNTIME = previousRuntime;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("configured AI route enforces zero-call budget and consent without contacting a provider", async () => {
  const dir = mkdtempSync(join(tmpdir(), "room-ai-route-"));
  const env = { SHARE_DB_PATH: join(dir, "ai.sqlite"), AI_PROVIDER: "openai-compatible", AI_BASE_URL: "https://provider.invalid/v1", AI_MODEL: "test-fixture-only", AI_API_KEY: "test-fixture-not-real", AI_DAILY_LIMIT: "0", AI_TOTAL_LIMIT: "100" };
  const previous = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]));
  Object.assign(process.env, env);
  const globalState = globalThis as typeof globalThis & { __roomShareStore?: SqliteShareStore; __roomCleanupTimer?: ReturnType<typeof setInterval> };
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("test must not contact provider"); };
  try {
    const { POST } = await import("../src/app/api/analyze/route");
    const source = await sharp({ create: { width: 100, height: 80, channels: 3, background: "#222222" } }).jpeg().toBuffer();
    const body = { consent: true, dataUrl: `data:image/jpeg;base64,${source.toString("base64")}`, requestId: "budget-test-request-id-1234" };
    function request(data: unknown) { return new NextRequest("http://localhost:3000/api/analyze", { method: "POST", headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" }, body: JSON.stringify(data) }); }
    assert.equal((await POST(request({ ...body, consent: false }))).status, 400);
    const response = await POST(request(body));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "manual", reason: "budget", candidates: [] });
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (globalState.__roomCleanupTimer) clearInterval(globalState.__roomCleanupTimer);
    globalState.__roomShareStore?.close(); delete globalState.__roomShareStore; delete globalState.__roomCleanupTimer;
    for (const key of Object.keys(env)) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
    rmSync(dir, { recursive: true, force: true });
  }
});

test("real route handlers require photo consent, issue private cookies, keep public JSON safe, and delete the link", async () => {
  const dir = mkdtempSync(join(tmpdir(), "room-routes-"));
  const previousPath = process.env.SHARE_DB_PATH;
  process.env.SHARE_DB_PATH = join(dir, "routes.sqlite");
  const globalState = globalThis as typeof globalThis & { __roomShareStore?: SqliteShareStore; __roomCleanupTimer?: ReturnType<typeof setInterval> };
  const createRoute = await import("../src/app/api/shared-cases/route");
  const shareRoute = await import("../src/app/api/shared-cases/[shareId]/route");
  const playRoute = await import("../src/app/api/shared-cases/[shareId]/plays/route");
  const accuseRoute = await import("../src/app/api/plays/[playId]/accuse/route");
  const imageRoute = await import("../src/app/api/shared-cases/[shareId]/image/route");
  function request(path: string, method = "GET", body?: unknown, cookie?: string) {
    return new NextRequest(`http://localhost:3000${path}`, { method, headers: { Origin: "http://localhost:3000", ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  }
  try {
    const source = await sharp({ create: { width: 400, height: 300, channels: 3, background: "#312533" } }).jpeg().toBuffer();
    const body = { draft, scene: { dataUrl: `data:image/jpeg;base64,${source.toString("base64")}`, width: 400, height: 300 }, consent: true };
    assert.equal((await createRoute.POST(request("/api/shared-cases", "POST", { ...body, consent: false }))).status, 400);
    assert.equal((await createRoute.POST(new NextRequest("http://localhost:3000/api/shared-cases", { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: JSON.stringify(body) }))).status, 403);
    const created = await createRoute.POST(request("/api/shared-cases", "POST", body));
    assert.equal(created.status, 201);
    const ownerCookie = created.headers.get("set-cookie")!;
    assert.match(ownerCookie, /HttpOnly/i); assert.match(ownerCookie, /SameSite=strict/i);
    const { id, url } = await created.json();
    assert.equal(url, `/s/${id}`);
    const shareContext = { params: Promise.resolve({ shareId: id }) };
    const publicResponse = await shareRoute.GET(request(`/api/shared-cases/${id}?locale=en`), shareContext);
    assert.match(publicResponse.headers.get("cache-control")!, /no-store/);
    const publicData = await publicResponse.json();
    assert.equal(publicData.isOwner, false);
    assert.equal(publicData.locale, "en");
    assert.equal(JSON.stringify(publicData).includes('"culpritId"'), false);
    assert.equal(JSON.stringify(publicData).includes('"confession"'), false);
    const ownerData = await (await shareRoute.GET(request(`/api/shared-cases/${id}`, "GET", undefined, ownerCookie.split(";")[0]), shareContext)).json();
    assert.equal(ownerData.isOwner, true);
    const imageResponse = await imageRoute.GET(request(`/api/shared-cases/${id}/image`), shareContext);
    assert.equal(imageResponse.status, 200);
    assert.match(imageResponse.headers.get("cache-control")!, /no-store/);
    const started = await playRoute.POST(request(`/api/shared-cases/${id}/plays`, "POST"), shareContext);
    const playCookie = started.headers.get("set-cookie")!.split(";")[0], { playId } = await started.json();
    const playContext = { params: Promise.resolve({ playId }) };
    assert.equal((await accuseRoute.POST(request(`/api/plays/${playId}/accuse`, "POST", { suspectId: "s0" }), playContext)).status, 403);
    const requests = ["s0", "s2"].map(suspectId => accuseRoute.POST(request(`/api/plays/${playId}/accuse`, "POST", { suspectId, locale: "ko" }, playCookie), playContext));
    const responses = await Promise.all(requests), results = await Promise.all(responses.map(response => response.json()));
    assert.deepEqual(results[0], results[1]);
    assert.equal((await shareRoute.DELETE(request(`/api/shared-cases/${id}`, "DELETE", undefined, playCookie), shareContext)).status, 403);
    assert.equal((await shareRoute.DELETE(request(`/api/shared-cases/${id}`, "DELETE", undefined, ownerCookie.split(";")[0]), shareContext)).status, 200);
    assert.equal((await shareRoute.GET(request(`/api/shared-cases/${id}`), shareContext)).status, 404);
    assert.equal((await imageRoute.GET(request(`/api/shared-cases/${id}/image`), shareContext)).status, 404);
  } finally {
    if (globalState.__roomCleanupTimer) clearInterval(globalState.__roomCleanupTimer);
    globalState.__roomShareStore?.close();
    delete globalState.__roomShareStore; delete globalState.__roomCleanupTimer;
    if (previousPath === undefined) delete process.env.SHARE_DB_PATH; else process.env.SHARE_DB_PATH = previousPath;
    rmSync(dir, { recursive: true, force: true });
  }
});
