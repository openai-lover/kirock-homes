import { NextResponse } from "next/server";
import { getStore } from "../../../../../lib/server/share-store";
import { failure, privateHeaders } from "../../../../../lib/server/http";

export const runtime = "nodejs";
export async function GET(_request: Request, context: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await context.params;
    const image = getStore().getImage(shareId);
    return new NextResponse(new Uint8Array(image.bytes), { headers: { ...privateHeaders, "Content-Type": image.contentType, "Content-Length": String(image.bytes.length), "Content-Security-Policy": "default-src 'none'; sandbox" } });
  } catch (error) { return failure(error); }
}
