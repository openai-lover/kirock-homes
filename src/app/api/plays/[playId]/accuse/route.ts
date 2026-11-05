import { NextRequest } from "next/server";
import { getAppStore } from "../../../../../lib/server/app-store";

import { failure, json, PLAY_COOKIE, rateLimit, readJson, readLocale, sameOrigin } from "../../../../../lib/server/http";
import { ServiceError } from "../../../../../lib/server/errors";
import type { SuspectId } from "../../../../../lib/game";

export const runtime = "nodejs";
export async function POST(request: NextRequest, context: { params: Promise<{ playId: string }> }) {
  try {
    sameOrigin(request); rateLimit("accuse", 120);
    const body = await readJson(request, 4096);
    if (typeof body.suspectId !== "string" || !["s0", "s1", "s2"].includes(body.suspectId)) throw new ServiceError(400, "invalid_suspect");
    if (body.locale !== undefined && typeof body.locale !== "string") throw new ServiceError(400, "invalid_locale");
    const { playId } = await context.params;
    return json(await getAppStore().accuse(playId, request.cookies.get(PLAY_COOKIE)?.value ?? "", body.suspectId as SuspectId, readLocale(body.locale as string | undefined)));
  } catch (error) { return failure(error); }
}
