import "server-only";
import { DatabaseSync } from "node:sqlite";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { publicSnapshot, resolveCase, validateDraft, type CaseDraft, type Locale, type SuspectId } from "../game";
import { ServiceError } from "./errors";
import type { StoredImage } from "./image";
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from "../i18n/locales";

export const SHARE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
type Snapshot = ReturnType<typeof publicSnapshot>;
type Resolution = ReturnType<typeof resolveCase>;
// Old shares contain only Korean and English. Their stored words remain immutable.
export type FrozenCase = { snapshots: Partial<Record<Locale, Snapshot>>; results: Partial<Record<Locale, Record<SuspectId, Resolution>>> };
export type ShareRow = { id: string; private_json: string; image: Uint8Array; width: number; height: number; owner_hash: string; expires_at: number };
export type PlayRow = { id: string; share_id: string; token_hash: string; accusation: SuspectId | null; resolved_at: number | null };
export type PublicShare = Snapshot & { id: string; schemaVersion: 1; availableLocales: Locale[]; scene: { url: string; width: number; height: number }; expiresAt: string; isOwner: boolean };

export function storedLocale(frozen: FrozenCase, requested: Locale): Locale {
  if (!isLocale(requested)) throw new ServiceError(400, "invalid_locale");
  const available = (locale: Locale) => Boolean(frozen.snapshots[locale] && frozen.results[locale]);
  if (available(requested)) return requested;
  if (available(DEFAULT_LOCALE)) return DEFAULT_LOCALE;
  const fallback = SUPPORTED_LOCALES.find(available);
  if (!fallback) throw new ServiceError(500, "invalid_stored_case");
  return fallback;
}

export interface ShareStore {
  create(draft: unknown, image: StoredImage, ownerToken: string): { id: string; expiresAt: string };
  getPublic(id: string, locale: Locale, ownerToken?: string): PublicShare;
  getImage(id: string): StoredImage;
  startPlay(id: string, token: string): { playId: string };
  accuse(playId: string, token: string, suspectId: SuspectId, locale: Locale): Resolution;
  delete(id: string, ownerToken: string): void;
  cleanup(): { cases: number; plays: number; aiRequests: number };
}

export function newToken(): string { return randomBytes(24).toString("base64url"); }
export function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }
export function owns(token: string | undefined, expected: string): boolean {
  if (!token || token.length > 256) return false;
  return timingSafeEqual(Buffer.from(hash(token)), Buffer.from(expected));
}
export function validId(value: string): void {
  if (!/^[A-Za-z0-9_-]{32}$/.test(value)) throw new ServiceError(404, "not_found");
}

/** Durable single-host adapter. Keep this DB on persistent local disk, never a public path. */
export class SqliteShareStore implements ShareStore {
  private db: DatabaseSync;
  private lastCleanup = 0;
  constructor(path: string, private now: () => number = Date.now) {
    if (path !== ":memory:") mkdirSync(dirname(resolve(path)), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path);
    if (path !== ":memory:") chmodSync(path, 0o600);
    this.db.exec(`PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=DELETE; PRAGMA secure_delete=ON;
      CREATE TABLE IF NOT EXISTS shared_cases (
        id TEXT PRIMARY KEY, private_json TEXT NOT NULL, image BLOB NOT NULL,
        width INTEGER NOT NULL, height INTEGER NOT NULL, owner_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS play_sessions (
        id TEXT PRIMARY KEY, share_id TEXT NOT NULL REFERENCES shared_cases(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL, accusation TEXT, resolved_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS cases_expiry ON shared_cases(expires_at);
      CREATE INDEX IF NOT EXISTS plays_share ON play_sessions(share_id);
      CREATE TABLE IF NOT EXISTS ai_requests (
        id TEXT PRIMARY KEY, image_hash TEXT NOT NULL, result_json TEXT,
        created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS ai_image_requests ON ai_requests(image_hash);
      CREATE TABLE IF NOT EXISTS ai_budget (period TEXT PRIMARY KEY, used INTEGER NOT NULL);
    `);
  }
  close(): void { this.db.close(); }
  private active(id: string): ShareRow {
    validId(id);
    const row = this.db.prepare("SELECT * FROM shared_cases WHERE id=?").get(id) as ShareRow | undefined;
    if (!row) throw new ServiceError(404, "not_found");
    if (row.expires_at <= this.now()) {
      this.db.prepare("DELETE FROM shared_cases WHERE id=?").run(id);
      throw new ServiceError(410, "expired");
    }
    return row;
  }
  private periodicCleanup(): void {
    if (this.now() - this.lastCleanup >= 60 * 60 * 1000) this.cleanup();
  }
  create(input: unknown, image: StoredImage, ownerToken: string): { id: string; expiresAt: string } {
    const draft: CaseDraft = validateDraft(input);
    if (!/^[A-Za-z0-9_-]{32}$/.test(ownerToken)) throw new ServiceError(400, "invalid_owner");
    this.periodicCleanup();
    const count = this.db.prepare("SELECT COUNT(*) AS n FROM shared_cases").get() as { n: number };
    if (count.n >= 200) throw new ServiceError(507, "share_capacity_reached");
    const snapshots = Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, publicSnapshot(draft, locale)])) as FrozenCase["snapshots"];
    const results = Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, Object.fromEntries((["s0", "s1", "s2"] as const).map(id => [id, resolveCase(draft, id, locale)]))])) as FrozenCase["results"];
    const frozen: FrozenCase = { snapshots, results };
    const id = newToken(), createdAt = this.now(), expiresAt = createdAt + SHARE_LIFETIME_MS;
    // Image and private snapshot share one transaction/row: no orphaned upload can exist.
    this.db.prepare("INSERT INTO shared_cases VALUES (?,?,?,?,?,?,?,?)").run(id, JSON.stringify(frozen), image.bytes, image.width, image.height, hash(ownerToken), createdAt, expiresAt);
    return { id, expiresAt: new Date(expiresAt).toISOString() };
  }
  getPublic(id: string, locale: Locale, ownerToken?: string): PublicShare {
    const row = this.active(id), frozen = JSON.parse(row.private_json) as FrozenCase;
    const contentLocale = storedLocale(frozen, locale);
    const snapshot = frozen.snapshots[contentLocale]!;
    // Deliberate allow-list. Never spread database/private solution objects into public JSON.
    return { id, schemaVersion: 1, locale: contentLocale,
      availableLocales: SUPPORTED_LOCALES.filter(language => frozen.snapshots[language] && frozen.results[language]),
      title: snapshot.title, context: snapshot.context,
      suspects: snapshot.suspects, statements: snapshot.statements, characterLines: snapshot.characterLines,
      ...(snapshot.interrogations ? { interrogations: snapshot.interrogations } : {}),
      ...(snapshot.factLabels ? { factLabels: snapshot.factLabels } : {}),
      scene: { url: `/api/shared-cases/${id}/image`, width: row.width, height: row.height },
      expiresAt: new Date(row.expires_at).toISOString(), isOwner: owns(ownerToken, row.owner_hash) };
  }
  getImage(id: string): StoredImage {
    const row = this.active(id);
    return { bytes: Buffer.from(row.image), width: row.width, height: row.height, contentType: "image/jpeg" };
  }
  startPlay(id: string, token: string): { playId: string } {
    this.active(id);
    const count = this.db.prepare("SELECT COUNT(*) AS n FROM play_sessions WHERE share_id=?").get(id) as { n: number };
    if (count.n >= 2000) throw new ServiceError(429, "play_limit");
    const playId = newToken();
    this.db.prepare("INSERT INTO play_sessions (id,share_id,token_hash) VALUES (?,?,?)").run(playId, id, hash(token));
    return { playId };
  }
  accuse(playId: string, token: string, suspectId: SuspectId, locale: Locale): Resolution {
    validId(playId);
    if (!["s0", "s1", "s2"].includes(suspectId)) throw new ServiceError(400, "invalid_suspect");
    // BEGIN IMMEDIATE serializes competing requests, including requests from other server processes.
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const play = this.db.prepare("SELECT * FROM play_sessions WHERE id=?").get(playId) as PlayRow | undefined;
      if (!play) throw new ServiceError(404, "not_found");
      if (!owns(token, play.token_hash)) throw new ServiceError(403, "play_forbidden");
      const row = this.active(play.share_id), frozen = JSON.parse(row.private_json) as FrozenCase;
      const contentLocale = storedLocale(frozen, locale);
      const accusation = play.accusation ?? suspectId;
      if (play.accusation === null) this.db.prepare("UPDATE play_sessions SET accusation=?, resolved_at=? WHERE id=? AND accusation IS NULL").run(accusation, this.now(), playId);
      const result = frozen.results[contentLocale]![accusation];
      this.db.exec("COMMIT");
      return result;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  delete(id: string, ownerToken: string): void {
    const row = this.active(id);
    if (!owns(ownerToken, row.owner_hash)) throw new ServiceError(403, "owner_required");
    this.db.prepare("DELETE FROM shared_cases WHERE id=?").run(id);
  }
  cleanup(): { cases: number; plays: number; aiRequests: number } {
    const count = this.db.prepare("SELECT COUNT(*) AS n FROM play_sessions WHERE share_id IN (SELECT id FROM shared_cases WHERE expires_at<=?)").get(this.now()) as { n: number };
    const cases = Number(this.db.prepare("DELETE FROM shared_cases WHERE expires_at<=?").run(this.now()).changes);
    const aiRequests = Number(this.db.prepare("DELETE FROM ai_requests WHERE expires_at<=?").run(this.now()).changes);
    this.lastCleanup = this.now();
    return { cases, plays: count.n, aiRequests };
  }
  /** Deduplication plus persistent call caps; no image bytes or image names are retained. */
  beginAnalysis(id: string, imageHash: string, dailyLimit: number, totalLimit: number): { cached?: unknown; pending?: boolean } {
    this.periodicCleanup();
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existing = this.db.prepare("SELECT image_hash,result_json FROM ai_requests WHERE id=? AND expires_at>?").get(id, this.now()) as { image_hash: string; result_json: string | null } | undefined;
      if (existing) {
        if (existing.image_hash !== imageHash) throw new ServiceError(409, "request_id_reused");
        this.db.exec("COMMIT");
        return existing.result_json ? { cached: JSON.parse(existing.result_json) } : { pending: true };
      }
      const attempts = this.db.prepare("SELECT COUNT(*) AS n FROM ai_requests WHERE image_hash=? AND expires_at>?").get(imageHash, this.now()) as { n: number };
      if (attempts.n >= 2) throw new ServiceError(429, "ai_budget_reached");
      const day = new Date(this.now()).toISOString().slice(0, 10);
      for (const [period, limit] of [[day, dailyLimit], ["total", totalLimit]] as const) {
        const budget = this.db.prepare("SELECT used FROM ai_budget WHERE period=?").get(period) as { used: number } | undefined;
        if ((budget?.used ?? 0) >= limit) throw new ServiceError(429, "ai_budget_reached");
        this.db.prepare("INSERT INTO ai_budget (period,used) VALUES (?,1) ON CONFLICT(period) DO UPDATE SET used=used+1").run(period);
      }
      this.db.prepare("INSERT OR REPLACE INTO ai_requests VALUES (?,?,NULL,?,?)").run(id, imageHash, this.now(), this.now() + 15 * 60 * 1000);
      this.db.exec("COMMIT");
      return {};
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  finishAnalysis(id: string, result: unknown): void {
    this.db.prepare("UPDATE ai_requests SET result_json=? WHERE id=?").run(JSON.stringify(result), id);
  }
}

const globalStore = globalThis as typeof globalThis & { __roomShareStore?: SqliteShareStore; __roomCleanupTimer?: ReturnType<typeof setInterval> };
export function getStore(): SqliteShareStore {
  if (!globalStore.__roomShareStore) {
    globalStore.__roomShareStore = new SqliteShareStore(process.env.SHARE_DB_PATH || resolve(process.cwd(), ".data/room-of-suspects.sqlite"));
    const cleanup = () => {
      try {
        const counts = globalStore.__roomShareStore?.cleanup();
        console.info(JSON.stringify({ event: "room_cleanup", at: new Date().toISOString(), status: "ok", ...counts }));
      } catch { console.error(JSON.stringify({ event: "room_cleanup", at: new Date().toISOString(), status: "failed" })); }
    };
    cleanup();
    globalStore.__roomCleanupTimer = setInterval(cleanup, 60 * 60 * 1000);
    globalStore.__roomCleanupTimer.unref();
  }
  return globalStore.__roomShareStore;
}
