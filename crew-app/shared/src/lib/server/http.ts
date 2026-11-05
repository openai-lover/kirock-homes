import "server-only";
import { NextRequest, NextResponse } from "next/server";
import type { Locale } from "../game";
import { DEFAULT_LOCALE, isLocale } from "../i18n/locales";
import { isServiceError, ServiceError } from "./errors";

export const OWNER_COOKIE = "ros_owner";
export const PLAY_COOKIE = "ros_play";
export const privateHeaders = { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };
export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: privateHeaders });
}
export function failure(error: unknown): NextResponse {
  if (isServiceError(error)) return json({ error: error.code }, error.status);
  // User-controlled validation failures do not expose stack traces or saved case material.
  if (error instanceof Error && error.name === "ValidationError") return json({ error: "invalid_case" }, 400);
  return json({ error: "request_failed" }, 500);
}
export function readLocale(value: string | null | undefined): Locale {
  if (value === undefined || value === null) return DEFAULT_LOCALE;
  if (isLocale(value)) return value;
  throw new ServiceError(400, "invalid_locale");
}
export function sameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  // Next may normalize request.url to its internal localhost listener. The
  // incoming Host is the actual browser authority; do not trust forwarded-host.
  const incoming = new URL(request.url), host = request.headers.get("host");
  if (host && /[\s/@\\]/.test(host)) throw new ServiceError(403, "same_origin_required");
  const expected = process.env.APP_ORIGIN
    ? new URL(process.env.APP_ORIGIN).origin
    : new URL(`${incoming.protocol}//${host || incoming.host}`).origin;
  if (origin !== expected || request.headers.get("sec-fetch-site") === "cross-site") throw new ServiceError(403, "same_origin_required");
}
export function setPrivateCookie(response: NextResponse, request: NextRequest, name: string, token: string): void {
  response.cookies.set(name, token, { httpOnly: true, sameSite: "strict", secure: new URL(process.env.APP_ORIGIN || request.url).protocol === "https:", path: "/", maxAge: 8 * 24 * 60 * 60 });
}
export async function readJson(request: Request, maxBytes = 1_500_000): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ServiceError(415, "json_required");
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(declared) || declared > maxBytes) throw new ServiceError(413, "request_too_large");
  const reader = request.body?.getReader();
  if (!reader) throw new ServiceError(400, "body_required");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new ServiceError(413, "request_too_large"); }
    chunks.push(value);
  }
  try {
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("object required");
    return data as Record<string, unknown>;
  } catch { throw new ServiceError(400, "invalid_json"); }
}

// Local single-process traffic guard; persistent AI cost caps live in SQLite separately.
const buckets = new Map<string, { start: number; count: number }>();
export function rateLimit(scope: string, max: number, windowMs = 60_000): void {
  const now = Date.now(), current = buckets.get(scope);
  if (!current || current.start + windowMs <= now) { buckets.set(scope, { start: now, count: 1 }); return; }
  if (current.count >= max) throw new ServiceError(429, "rate_limited");
  current.count++;
}
