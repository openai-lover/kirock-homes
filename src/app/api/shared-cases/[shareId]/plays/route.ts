import { NextRequest } from "next/server";
import { getStore, newToken } from "../../../../../lib/server/share-store";
import { failure, json, PLAY_COOKIE, rateLimit, sameOrigin, setPrivateCookie } from "../../../../../lib/server/http";

export const runtime = "nodejs";
export async function POST(request: NextRequest, context: { params: Promise<{ shareId: string }> }) {
  try {
    sameOrigin(request); rateLimit("start-play", 120);
    const { shareId } = await context.params;
    const existing = request.cookies.get(PLAY_COOKIE)?.value;
    const token = existing && /^[A-Za-z0-9_-]{32}$/.test(existing) ? existing : newToken();
    const response = json(getStore().startPlay(shareId, token), 201);
    setPrivateCookie(response, request, PLAY_COOKIE, token);
    return response;
  } catch (error) { return failure(error); }
}
