import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@libsql/client';
import { TursoShareStore } from '../src/lib/server/turso-store';
import { newToken, SHARE_LIFETIME_MS } from '../src/lib/server/share-store';
import { createCase, publicSnapshot, resolveCase, type Suspect } from '../src/lib/game';
import { SUPPORTED_LOCALES } from '../src/lib/i18n/locales';
import { GET as cleanup } from '../src/app/api/maintenance/cleanup/route';

const suspects: Suspect[] = ['Cup', 'Lamp', 'Keyboard'].map((displayName, i) => ({ id: `s${i}` as Suspect['id'], displayName, kind: 'other', face: { x: .2 + i * .2, y: .5, scale: .16, rotation: 0 }, personalityId: 'dry' }));
const draft = createCase(suspects, { seed: 13 });
const image = { bytes: Buffer.from('test-image'), width: 400, height: 300, contentType: 'image/jpeg' as const };
const code = (expected: string) => (error: unknown) => error instanceof Error && 'code' in error && error.code === expected;

test('cloud SQL adapter freezes ten languages, survives independent clients, authorizes and keeps first verdict', async () => {
 const dir = mkdtempSync(join(tmpdir(), 'kirock-cloud-'));
 const url = `file:${join(dir, 'db.sqlite')}`;
 const one = new TursoShareStore(createClient({ url })), two = new TursoShareStore(createClient({ url }));
 try {
  const owner = newToken(), token = newToken(), other = newToken();
  const { id } = await one.create(draft, image, owner);
  for (const locale of SUPPORTED_LOCALES) {
   const snap = await two.getPublic(id, locale);
   assert.deepEqual(snap.statements, publicSnapshot(draft, locale).statements);
   assert.deepEqual(snap.characterLines, publicSnapshot(draft, locale).characterLines);
   for (const forbidden of ['culpritId', 'confession', 'proofSteps', 'roleAssignment', 'private_json']) assert.equal(JSON.stringify(snap).includes(`"${forbidden}"`), false);
  }
  assert.deepEqual((await two.getImage(id)).bytes, image.bytes);
  assert.equal((await two.getPublic(id, 'en', owner)).isOwner, true);
  const { playId } = await one.startPlay(id, token), friend = await two.startPlay(id, other);
  await assert.rejects(two.accuse(playId, other, 's1', 'en'), code('play_forbidden'));
  await assert.rejects(two.delete(id, token), code('owner_required'));
  const first = await one.accuse(playId, token, 's0', 'en');
  assert.deepEqual(await two.accuse(playId, token, 's2', 'en'), first);
  assert.deepEqual(first, resolveCase(draft, 's0', 'en'));
  assert.equal((await two.accuse(friend.playId, other, 's1', 'en')).accusedId, 's1');
  await two.delete(id, owner);
  await assert.rejects(one.getPublic(id, 'en'), code('not_found'));
  await assert.rejects(one.getImage(id), code('not_found'));
  await assert.rejects(one.accuse(playId, token, 's0', 'en'), code('not_found'));
 } finally { one.close(); two.close(); rmSync(dir, { recursive: true, force: true }); }
});

test('cloud expiry denies every endpoint immediately and cleanup removes photo and dependent plays', async () => {
 let now = 1800000000000;
 const store = new TursoShareStore(createClient({ url: ':memory:' }), () => now);
 try {
  const token = newToken(), { id } = await store.create(draft, image, newToken()), { playId } = await store.startPlay(id, token);
  now += SHARE_LIFETIME_MS;
  await assert.rejects(store.getPublic(id, 'en'), code('expired'));
  await assert.rejects(store.getImage(id), code('expired'));
  await assert.rejects(store.startPlay(id, token), code('expired'));
  await assert.rejects(store.accuse(playId, token, 's0', 'en'), code('expired'));
  assert.deepEqual(await store.cleanup(), { cases: 1, plays: 1, aiRequests: 0 });
  await assert.rejects(store.getImage(id), code('not_found'));
 } finally { store.close(); }
});

test('cloud AI caps and duplicate requests remain durable without keeping input text', async () => {
 const store = new TursoShareStore(createClient({ url: ':memory:' }));
 try {
  await assert.rejects(store.beginAnalysis('a', 'img', 0, 100), code('ai_budget_reached'));
  assert.deepEqual(await store.beginAnalysis('a', 'img', 2, 2), {});
  assert.deepEqual(await store.beginAnalysis('a', 'img', 2, 2), { pending: true });
  await assert.rejects(store.beginAnalysis('a', 'different', 2, 2), code('request_id_reused'));
  await store.finishAnalysis('a', { status: 'manual', candidates: [] });
  assert.deepEqual(await store.beginAnalysis('a', 'img', 2, 2), { cached: { status: 'manual', candidates: [] } });
  assert.deepEqual(await store.begin('q0', 'case', 0, 20), { reason: 'budget' });
  assert.deepEqual(await store.begin('q1', 'case', 1, 20), {});
  assert.deepEqual(await store.begin('q1', 'case', 1, 20), { reason: 'pending' });
  assert.deepEqual(await store.begin('q2', 'case', 1, 20), { reason: 'budget' });
 } finally { store.close(); }
});

test('cleanup endpoint refuses absent or incorrect credentials before opening storage', async () => {
 const previous = process.env.CRON_SECRET;
 try {
  delete process.env.CRON_SECRET;
  assert.equal((await cleanup(new Request('https://example.com/api/maintenance/cleanup'))).status, 401);
  process.env.CRON_SECRET = 'x'.repeat(48);
  assert.equal((await cleanup(new Request('https://example.com/api/maintenance/cleanup', { headers: { authorization: 'Bearer wrong' } }))).status, 401);
 } finally { if (previous === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = previous; }
});
