import { resolve } from "node:path";
import { SqliteShareStore } from "../src/lib/server/share-store";

const store = new SqliteShareStore(process.env.SHARE_DB_PATH || resolve(process.cwd(), ".data/room-of-suspects.sqlite"));
try {
  const result = store.cleanup();
  // Operational counts only. Do not print case IDs, object names, tokens, or photos.
  process.stdout.write(`${JSON.stringify({ at: new Date().toISOString(), status: "ok", ...result })}\n`);
} catch {
  process.stderr.write(`${JSON.stringify({ at: new Date().toISOString(), status: "failed" })}\n`);
  process.exitCode = 1;
} finally { store.close(); }
