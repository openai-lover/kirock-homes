import 'server-only';
import { getStore } from './share-store';
import { createTursoStore, type TursoShareStore } from './turso-store';
import { ServiceError } from './errors';

const state = globalThis as typeof globalThis & { __tursoStore?: TursoShareStore };
export function getAppStore() {
  if (process.env.TURSO_DATABASE_URL) return state.__tursoStore ??= createTursoStore();
  // A cloud misconfiguration must fail closed, never silently create a disposable DB.
  if (process.env.VERCEL) throw new ServiceError(503, 'storage_not_configured');
  return getStore();
}
export function getRemoteChatBudget() {
  if (process.env.TURSO_DATABASE_URL) return state.__tursoStore ??= createTursoStore();
  if (process.env.VERCEL) throw new ServiceError(503, 'storage_not_configured');
  return null;
}
