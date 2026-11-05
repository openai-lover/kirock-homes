import test from "node:test";
import assert from "node:assert/strict";
import { analyzeWithFallback, validateCandidates, type VisionProvider } from "../src/lib/ai/provider";
import { CompatibleVisionProvider, configuredProvider } from "../src/lib/ai/live-provider.server";

// All provider doubles are explicitly test fixtures. Production has no fake vision result.
const candidates = ["Cup", "Lamp", "Book"].map((displayName, i) => ({ displayName, kind: ["cup", "lamp", "book"][i], face: { x: .2 + i * .2, y: .5, scale: .15, rotation: 0 }, personalityId: "dry" }));

test("missing key gives honest manual fallback and accepts no fake detections", async () => {
  assert.equal(configuredProvider({ AI_PROVIDER: "openai-compatible", AI_MODEL: "test", AI_BASE_URL: "https://example.com/v1" }), null);
  assert.deepEqual(await analyzeWithFallback(null, "test"), { status: "manual", reason: "not_configured", candidates: [] });
});

test("provider timeout aborts pending work and ignores a late result", async () => {
  let aborted = false;
  const provider: VisionProvider = { analyzeObjects: (_data, signal) => new Promise(resolve => {
    signal.addEventListener("abort", () => { aborted = true; });
    setTimeout(() => resolve({ candidates }), 70);
  }) };
  const start = performance.now(), result = await analyzeWithFallback(provider, "test", 15);
  assert.equal(result.status, "manual");
  assert.equal(result.status === "manual" && result.reason, "timeout");
  assert.equal(aborted, true);
  assert.ok(performance.now() - start < 250);
  await new Promise(resolve => setTimeout(resolve, 80));
  assert.deepEqual(result.candidates, []);
});

test("malformed JSON, bad coordinates and unavailable provider always allow manual casting", async () => {
  const badCoordinate = structuredClone(candidates); badCoordinate[0].face.x = 1.3;
  for (const raw of [null, "garbage", { candidates: [] }, { candidates: badCoordinate }, { candidates: [...candidates, candidates[0]] }]) {
    const result = await analyzeWithFallback({ analyzeObjects: async () => raw }, "test");
    assert.deepEqual(result, { status: "manual", reason: "invalid_output", candidates: [] });
  }
  assert.deepEqual(await analyzeWithFallback({ analyzeObjects: async () => { throw new Error("offline"); } }, "test"), { status: "manual", reason: "unavailable", candidates: [] });
  assert.deepEqual(await analyzeWithFallback({ analyzeObjects: async () => { throw new SyntaxError("invalid json"); } }, "test"), { status: "manual", reason: "invalid_output", candidates: [] });
});

test("AI output can only select approved traits and positions, never dialogue or official testimony", () => {
  const raw = structuredClone(candidates).map(item => ({ ...item, officialStatement: "I am innocent", confession: "spoiler", firstLine: "invented personal fact" }));
  const output = validateCandidates({ candidates: raw });
  assert.deepEqual(output, candidates);
  raw[0].kind = "person";
  assert.equal(validateCandidates({ candidates: raw })[0].kind, "other");
  raw[0].personalityId = "guilty";
  assert.throws(() => validateCandidates({ candidates: raw }));
});

test("compatible adapter sends bounded vision request and parses mocked structured response", async () => {
  let callCount = 0;
  const fetcher: typeof fetch = async (input, init) => {
    callCount++;
    assert.equal(String(input), "https://provider.example/v1/chat/completions");
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer test-key-not-real");
    const body = JSON.parse(init?.body as string);
    assert.equal(body.max_tokens, 900);
    assert.equal(body.messages[1].content[1].image_url.url, "data:image/jpeg;base64,TEST");
    assert.ok(!JSON.stringify(body).includes("culpritId"));
    return Response.json({ choices: [{ message: { content: JSON.stringify({ candidates }) } }] });
  };
  const provider = new CompatibleVisionProvider({ apiKey: "test-key-not-real", model: "test-vision-model", baseUrl: "https://provider.example/v1/" }, fetcher);
  assert.deepEqual(await analyzeWithFallback(provider, "data:image/jpeg;base64,TEST"), { status: "ready", candidates });
  assert.equal(callCount, 1);
});
