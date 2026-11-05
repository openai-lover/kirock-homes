import { NextRequest } from "next/server";
import { getStore, newToken } from "../../../lib/server/share-store";
import { sanitizeImage } from "../../../lib/server/image";
import { ServiceError } from "../../../lib/server/errors";
import { failure, json, OWNER_COOKIE, rateLimit, readJson, sameOrigin, setPrivateCookie } from "../../../lib/server/http";
import { validateDraft } from "../../../lib/game";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    sameOrigin(request); rateLimit("create-share", 20);
    const body = await readJson(request);
    if (body.consent !== true) throw new ServiceError(400, "photo_consent_required");
    let draft;
    try { draft = validateDraft(body.draft); } catch { throw new ServiceError(400, "invalid_case"); }
    if (!body.scene || typeof body.scene !== "object" || Array.isArray(body.scene)) throw new ServiceError(400, "invalid_scene");
    const scene = body.scene as Record<string, unknown>;
    const image = await sanitizeImage(scene.dataUrl);
    if (scene.width !== image.width || scene.height !== image.height) throw new ServiceError(400, "image_dimensions_mismatch");
    const existingOwner = request.cookies.get(OWNER_COOKIE)?.value;
    const token = existingOwner && /^[A-Za-z0-9_-]{32}$/.test(existingOwner) ? existingOwner : newToken();
    const created = getStore().create(draft, image, token);
    const response = json({ ...created, url: `/s/${created.id}` }, 201);
    setPrivateCookie(response, request, OWNER_COOKIE, token);
    return response;
  } catch (error) { return failure(error); }
}
