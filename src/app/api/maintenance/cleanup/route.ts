import { timingSafeEqual } from 'node:crypto';
import { getAppStore } from '@/lib/server/app-store';
import { failure, json } from '@/lib/server/http';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const actual = Buffer.from(request.headers.get('authorization') || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || secret.length < 32 || actual.length !== expected.length || !timingSafeEqual(actual, expected)) return json({ error: 'unauthorized' }, 401);
  try { return json(await getAppStore().cleanup()); } catch (error) { return failure(error); }
}
