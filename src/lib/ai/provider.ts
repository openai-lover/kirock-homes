import type { Suspect } from "../game";

export type ObjectCandidate = Pick<Suspect, "displayName" | "kind" | "face" | "personalityId">;
export type AnalysisResult =
  | { status: "ready"; candidates: ObjectCandidate[] }
  | { status: "manual"; candidates: []; reason: "not_configured" | "timeout" | "invalid_output" | "unavailable" | "budget" | "pending" };

export interface VisionProvider {
  analyzeObjects(dataUrl: string, signal: AbortSignal): Promise<unknown>;
}
class InvalidOutput extends Error {}

export function validateCandidates(raw: unknown): ObjectCandidate[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new InvalidOutput();
  const candidates = (raw as Record<string, unknown>).candidates;
  if (!Array.isArray(candidates) || candidates.length < 3 || candidates.length > 6) throw new InvalidOutput();
  const result = candidates.map((item): ObjectCandidate => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new InvalidOutput();
    const obj = item as Record<string, unknown>, face = obj.face as Record<string, unknown> | undefined;
    if (typeof obj.displayName !== "string" || obj.displayName.trim().length < 1 || obj.displayName.length > 30 || /[\u0000-\u001f\u007f<>]/.test(obj.displayName)) throw new InvalidOutput();
    if (!face || typeof face !== "object" || Array.isArray(face)) throw new InvalidOutput();
    for (const [key, min, max] of [["x", 0, 1], ["y", 0, 1], ["scale", 0.08, 0.3], ["rotation", -45, 45]] as const) {
      if (typeof face[key] !== "number" || !Number.isFinite(face[key]) || face[key] < min || face[key] > max) throw new InvalidOutput();
    }
    if (typeof obj.personalityId !== "string" || !["dry", "dramatic", "sleepy", "cheerful"].includes(obj.personalityId)) throw new InvalidOutput();
    const kind = typeof obj.kind === "string" && ["cup", "lamp", "electronics", "book", "plant", "toy", "other"].includes(obj.kind) ? obj.kind as ObjectCandidate["kind"] : "other";
    // Allow-list selection only: provider text cannot become testimony, confessions, or dialogue.
    return { displayName: obj.displayName.trim(), kind,
      personalityId: obj.personalityId as ObjectCandidate["personalityId"],
      face: { x: face.x as number, y: face.y as number, scale: face.scale as number, rotation: face.rotation as number } };
  });
  if (new Set(result.map(item => item.displayName.normalize("NFKC").toLocaleLowerCase())).size !== result.length) throw new InvalidOutput();
  return result;
}

export async function analyzeWithFallback(provider: VisionProvider | null, dataUrl: string, timeoutMs = 8000): Promise<AnalysisResult> {
  if (!provider) return { status: "manual", reason: "not_configured", candidates: [] };
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const response = await Promise.race([
      provider.analyzeObjects(dataUrl, controller.signal),
      new Promise<never>((_, reject) => { timer = setTimeout(() => { timedOut = true; controller.abort(); reject(new Error("timeout")); }, timeoutMs); }),
    ]);
    try { return { status: "ready", candidates: validateCandidates(response) }; }
    catch { return { status: "manual", reason: "invalid_output", candidates: [] }; }
  } catch (error) {
    return { status: "manual", reason: timedOut ? "timeout" : error instanceof SyntaxError ? "invalid_output" : "unavailable", candidates: [] };
  } finally { if (timer) clearTimeout(timer); controller.abort(); }
}
