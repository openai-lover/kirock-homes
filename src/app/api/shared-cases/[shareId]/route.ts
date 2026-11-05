import { NextRequest } from "next/server";
import { getStore } from "../../../../lib/server/share-store";
import { failure, json, OWNER_COOKIE, rateLimit, readLocale, sameOrigin } from "../../../../lib/server/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ shareId: string }> };
export async function GET(request: NextRequest, context: Context) {
  try {
    const { shareId } = await context.params;
    return json(getStore().getPublic(shareId, readLocale(request.nextUrl.searchParams.get("locale")), request.cookies.get(OWNER_COOKIE)?.value));
  } catch (error) { return failure(error); }
}
export async function DELETE(request: NextRequest, context: Context) {
  try {
    sameOrigin(request); rateLimit("delete-share", 60);
    const { shareId } = await context.params;
    getStore().delete(shareId, request.cookies.get(OWNER_COOKIE)?.value ?? "");
    return json({ deleted: true });
  } catch (error) { return failure(error); }
}
