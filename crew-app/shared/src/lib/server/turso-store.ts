import 'server-only';
import { createClient, type Client, type InArgs, type Transaction } from '@libsql/client/web';
import { publicSnapshot, resolveCase, validateDraft, type Locale, type SuspectId } from '../game';
import { SUPPORTED_LOCALES } from '../i18n/locales';
import { hash, newToken, owns, validId, storedLocale, SHARE_LIFETIME_MS, type FrozenCase, type PublicShare, type ShareRow, type PlayRow } from './share-store';
import type { StoredImage } from './image';
import { ServiceError } from './errors';
import type { ChatAnswer } from '../chat/provider.server';

type Executor = Pick<Client, 'execute'>;
const schema = [
  `CREATE TABLE IF NOT EXISTS shared_cases (id TEXT PRIMARY KEY, private_json TEXT NOT NULL, image BLOB NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, owner_hash TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS play_sessions (id TEXT PRIMARY KEY, share_id TEXT NOT NULL REFERENCES shared_cases(id) ON DELETE CASCADE, token_hash TEXT NOT NULL, accusation TEXT, resolved_at INTEGER)`,
  `CREATE INDEX IF NOT EXISTS cases_expiry ON shared_cases(expires_at)`,
  `CREATE INDEX IF NOT EXISTS plays_share ON play_sessions(share_id)`,
  `CREATE TABLE IF NOT EXISTS ai_requests (id TEXT PRIMARY KEY, image_hash TEXT NOT NULL, result_json TEXT, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS ai_image_requests ON ai_requests(image_hash)`,
  `CREATE TABLE IF NOT EXISTS ai_budget (period TEXT PRIMARY KEY, used INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS chat_cache (id TEXT PRIMARY KEY, case_hash TEXT, answer TEXT, expires INTEGER)`,
  `CREATE TABLE IF NOT EXISTS chat_budget (period TEXT PRIMARY KEY, used INTEGER)`,
];
async function row<T>(db: Executor, sql: string, args: InArgs = []): Promise<T | undefined> {
  return (await db.execute({ sql, args })).rows[0] as unknown as T | undefined;
}

/** Remote primary only: never uses an ephemeral replica or a serverless local file. */
export class TursoShareStore {
  private ready?: Promise<void>;
  constructor(private db: Client, private now: () => number = Date.now) {}
  private initialize(): Promise<void> {
    return this.ready ??= this.db.batch(schema, 'write').then(() => undefined).catch(error => { this.ready = undefined; throw error; });
  }
  close(): void { this.db.close(); }
  private async transaction<T>(action: (tx: Transaction) => Promise<T>): Promise<T> {
    await this.initialize();
    const tx = await this.db.transaction('write');
    try { const result = await action(tx); await tx.commit(); return result; }
    catch (error) { await tx.rollback(); throw error; }
    finally { tx.close(); }
  }
  private async active(id: string, db: Executor = this.db): Promise<ShareRow> {
    validId(id);
    const found = await row<ShareRow>(db, 'SELECT * FROM shared_cases WHERE id=?', [id]);
    if (!found) throw new ServiceError(404, 'not_found');
    if (found.expires_at <= this.now()) throw new ServiceError(410, 'expired');
    return found;
  }
  async create(input: unknown, image: StoredImage, ownerToken: string) {
    const draft = validateDraft(input);
    if (!/^[A-Za-z0-9_-]{32}$/.test(ownerToken)) throw new ServiceError(400, 'invalid_owner');
    const frozen: FrozenCase = {
      snapshots: Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, publicSnapshot(draft, locale)])),
      results: Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, Object.fromEntries((['s0', 's1', 's2'] as const).map(id => [id, resolveCase(draft, id, locale)]))])),
    };
    const id = newToken(), now = this.now(), expiresAt = now + SHARE_LIFETIME_MS;
    // Freeze expensive pure computation before taking a write lock.
    const privateJson = JSON.stringify(frozen);
    await this.transaction(async tx => {
      await this.removeExpired(tx);
      const count = await row<{ n: number }>(tx, 'SELECT COUNT(*) n FROM shared_cases');
      if (Number(count?.n) >= 200) throw new ServiceError(507, 'share_capacity_reached');
      await tx.execute({ sql: 'INSERT INTO shared_cases VALUES (?,?,?,?,?,?,?,?)', args: [id, privateJson, image.bytes, image.width, image.height, hash(ownerToken), now, expiresAt] });
    });
    return { id, expiresAt: new Date(expiresAt).toISOString() };
  }
  async getPublic(id: string, locale: Locale, ownerToken?: string): Promise<PublicShare> {
    await this.initialize();
    const found = await this.active(id), frozen = JSON.parse(found.private_json) as FrozenCase;
    const contentLocale = storedLocale(frozen, locale), snapshot = frozen.snapshots[contentLocale]!;
    // Explicit public allow-list; private_json and the solution never leave this adapter.
    return { id, schemaVersion: 1, locale: contentLocale,
      availableLocales: SUPPORTED_LOCALES.filter(language => frozen.snapshots[language] && frozen.results[language]),
      title: snapshot.title, context: snapshot.context, suspects: snapshot.suspects,
      statements: snapshot.statements, characterLines: snapshot.characterLines,
      ...(snapshot.interrogations ? { interrogations: snapshot.interrogations } : {}),
      ...(snapshot.factLabels ? { factLabels: snapshot.factLabels } : {}),
      scene: { url: `/api/shared-cases/${id}/image`, width: found.width, height: found.height },
      expiresAt: new Date(found.expires_at).toISOString(), isOwner: owns(ownerToken, found.owner_hash) };
  }
  async getImage(id: string): Promise<StoredImage> {
    await this.initialize();
    const found = await this.active(id);
    return { bytes: Buffer.from(found.image), width: found.width, height: found.height, contentType: 'image/jpeg' };
  }
  async startPlay(id: string, token: string) {
    return this.transaction(async tx => {
      await this.active(id, tx);
      const count = await row<{ n: number }>(tx, 'SELECT COUNT(*) n FROM play_sessions WHERE share_id=?', [id]);
      if (Number(count?.n) >= 2000) throw new ServiceError(429, 'play_limit');
      const playId = newToken();
      await tx.execute({ sql: 'INSERT INTO play_sessions (id,share_id,token_hash) VALUES (?,?,?)', args: [playId, id, hash(token)] });
      return { playId };
    });
  }
  async accuse(playId: string, token: string, suspectId: SuspectId, locale: Locale) {
    validId(playId);
    if (!['s0', 's1', 's2'].includes(suspectId)) throw new ServiceError(400, 'invalid_suspect');
    return this.transaction(async tx => {
      const play = await row<PlayRow>(tx, 'SELECT * FROM play_sessions WHERE id=?', [playId]);
      if (!play) throw new ServiceError(404, 'not_found');
      if (!owns(token, play.token_hash)) throw new ServiceError(403, 'play_forbidden');
      const found = await this.active(play.share_id, tx), frozen = JSON.parse(found.private_json) as FrozenCase;
      const contentLocale = storedLocale(frozen, locale), accusation = play.accusation ?? suspectId;
      if (play.accusation === null) await tx.execute({ sql: 'UPDATE play_sessions SET accusation=?, resolved_at=? WHERE id=? AND accusation IS NULL', args: [accusation, this.now(), playId] });
      return frozen.results[contentLocale]![accusation];
    });
  }
  async delete(id: string, token: string) {
    await this.transaction(async tx => {
      const found = await this.active(id, tx);
      if (!owns(token, found.owner_hash)) throw new ServiceError(403, 'owner_required');
      // Explicit child removal also works when a connection has foreign_keys off.
      await tx.execute({ sql: 'DELETE FROM play_sessions WHERE share_id=?', args: [id] });
      await tx.execute({ sql: 'DELETE FROM shared_cases WHERE id=?', args: [id] });
    });
  }
  private async removeExpired(tx: Executor) {
    const args = [this.now()];
    const plays = await tx.execute({ sql: 'DELETE FROM play_sessions WHERE share_id IN (SELECT id FROM shared_cases WHERE expires_at<=?)', args });
    const cases = await tx.execute({ sql: 'DELETE FROM shared_cases WHERE expires_at<=?', args });
    const ai = await tx.execute({ sql: 'DELETE FROM ai_requests WHERE expires_at<=?', args });
    await tx.execute({ sql: 'DELETE FROM chat_cache WHERE expires<=?', args });
    return { cases: cases.rowsAffected, plays: plays.rowsAffected, aiRequests: ai.rowsAffected };
  }
  async cleanup() { return this.transaction(tx => this.removeExpired(tx)); }
  async beginAnalysis(id: string, imageHash: string, dailyLimit: number, totalLimit: number): Promise<{ cached?: unknown; pending?: boolean }> {
    return this.transaction(async tx => {
      await this.removeExpired(tx);
      const old = await row<{ image_hash: string; result_json: string | null }>(tx, 'SELECT image_hash,result_json FROM ai_requests WHERE id=?', [id]);
      if (old) {
        if (old.image_hash !== imageHash) throw new ServiceError(409, 'request_id_reused');
        return old.result_json ? { cached: JSON.parse(old.result_json) } : { pending: true };
      }
      const count = await row<{ n: number }>(tx, 'SELECT COUNT(*) n FROM ai_requests WHERE image_hash=?', [imageHash]);
      if (Number(count?.n) >= 2) throw new ServiceError(429, 'ai_budget_reached');
      for (const [period, limit] of [[new Date(this.now()).toISOString().slice(0, 10), dailyLimit], ['total', totalLimit]] as const) {
        const budget = await row<{ used: number }>(tx, 'SELECT used FROM ai_budget WHERE period=?', [period]);
        if (Number(budget?.used ?? 0) >= limit) throw new ServiceError(429, 'ai_budget_reached');
        await tx.execute({ sql: 'INSERT INTO ai_budget VALUES (?,1) ON CONFLICT(period) DO UPDATE SET used=used+1', args: [period] });
      }
      await tx.execute({ sql: 'INSERT INTO ai_requests VALUES (?,?,NULL,?,?)', args: [id, imageHash, this.now(), this.now() + 900000] });
      return {};
    });
  }
  async finishAnalysis(id: string, result: unknown) {
    await this.initialize();
    await this.db.execute({ sql: 'UPDATE ai_requests SET result_json=? WHERE id=?', args: [JSON.stringify(result), id] });
  }
  async begin(id: string, caseHash: string, daily: number, total: number): Promise<{ cached?: ChatAnswer; reason?: 'budget' | 'pending' }> {
    return this.transaction(async tx => {
      await tx.execute({ sql: 'DELETE FROM chat_cache WHERE expires<=?', args: [this.now()] });
      const old = await row<{ answer: string | null }>(tx, 'SELECT answer FROM chat_cache WHERE id=?', [id]);
      if (old) return old.answer ? { cached: JSON.parse(old.answer) } : { reason: 'pending' };
      const count = await row<{ n: number }>(tx, 'SELECT COUNT(*) n FROM chat_cache WHERE case_hash=?', [caseHash]);
      if (Number(count?.n) >= 24) return { reason: 'budget' };
      const periods = [[new Date(this.now()).toISOString().slice(0, 10), daily], ['total', total]] as const;
      for (const [period, limit] of periods) {
        const used = await row<{ used: number }>(tx, 'SELECT used FROM chat_budget WHERE period=?', [period]);
        if (Number(used?.used ?? 0) >= limit) return { reason: 'budget' };
      }
      for (const [period] of periods) await tx.execute({ sql: 'INSERT INTO chat_budget VALUES (?,1) ON CONFLICT(period) DO UPDATE SET used=used+1', args: [period] });
      await tx.execute({ sql: 'INSERT INTO chat_cache VALUES (?,?,NULL,?)', args: [id, caseHash, this.now() + 3600000] });
      return {};
    });
  }
  async finish(id: string, answer: ChatAnswer) {
    await this.initialize();
    await this.db.execute({ sql: 'UPDATE chat_cache SET answer=? WHERE id=?', args: [JSON.stringify(answer), id] });
  }
}

export function createTursoStore() {
  const url = process.env.TURSO_DATABASE_URL, authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken || !/^(libsql|https):\/\//.test(url)) throw new ServiceError(503, 'storage_not_configured');
  return new TursoShareStore(createClient({ url, authToken }));
}
