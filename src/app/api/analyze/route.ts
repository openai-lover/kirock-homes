import { NextRequest } from "next/server";
import { configuredProvider } from "../../../lib/ai/live-provider.server";
import { analyzeWithFallback, type AnalysisResult } from "../../../lib/ai/provider";
import { getAppStore } from "../../../lib/server/app-store";
import { hash } from "../../../lib/server/share-store";
import { sanitizeImage } from "../../../lib/server/image";
import { failure, json, rateLimit, readJson, sameOrigin } from "../../../lib/server/http";
import { isServiceError, ServiceError } from "../../../lib/server/errors";
import { isLoopbackHost } from '../../../lib/kiro/runtime.server';

export const runtime = "nodejs";
function limit(value: string | undefined, fallback: number): number {
  const number = Number(value ?? fallback);
  return Number.isInteger(number) && number >= 0 && number <= 10_000 ? number : fallback;
}
export async function POST(request: NextRequest) {
  try {
    sameOrigin(request); rateLimit("analyze", 30);
    const body = await readJson(request);
    const provider = process.env.AI_PROVIDER === 'kiro' && !isLoopbackHost(request.headers.get('host')) ? null : configuredProvider();
    if (!provider) return json({ status: "manual", reason: "not_configured", candidates: [] });
    if (body.consent !== true) throw new ServiceError(400, "analysis_consent_required");
    if (typeof body.requestId !== "string" || !/^[A-Za-z0-9_-]{12,80}$/.test(body.requestId)) throw new ServiceError(400, "invalid_request_id");
    const image = await sanitizeImage(body.dataUrl);
    // requestId is global only as a hash; repeat calls cannot evade the cost cap.
    const id = hash(body.requestId), store = getAppStore();
    let result: AnalysisResult;
    try {
      const analysis = await store.beginAnalysis(id, hash(image.bytes.toString("base64")), limit(process.env.AI_DAILY_LIMIT, 20), limit(process.env.AI_TOTAL_LIMIT, 100));
      if (analysis.cached) result = analysis.cached as AnalysisResult;
      else if (analysis.pending) result = { status: "manual", reason: "pending", candidates: [] };
      else {
        result = await analyzeWithFallback(provider, `data:image/jpeg;base64,${image.bytes.toString("base64")}`, process.env.AI_PROVIDER === 'kiro' ? 55000 : 8000);
        await store.finishAnalysis(id, result);
      }
    } catch (error) {
      if (isServiceError(error) && error.code === "ai_budget_reached") result = { status: "manual", reason: "budget", candidates: [] };
      else throw error;
    }
    return json(result);
  } catch (error) { return failure(error); }
}
