import "server-only";
import sharp from "sharp";
import { isServiceError, ServiceError } from "./errors";

export type StoredImage = { bytes: Buffer; width: number; height: number; contentType: "image/jpeg" };
const MAX_IMAGE_BYTES = 1_048_576;

/** Decode real image bytes, apply EXIF orientation, and strip all metadata. */
export async function sanitizeImage(dataUrl: unknown): Promise<StoredImage> {
  if (typeof dataUrl !== "string" || dataUrl.length > 1_400_000) throw new ServiceError(413, "image_too_large");
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match || match[2].length % 4 !== 0) throw new ServiceError(400, "invalid_image");
  const input = Buffer.from(match[2], "base64");
  if (input.length > MAX_IMAGE_BYTES) throw new ServiceError(413, "image_too_large");
  try {
    const metadata = await sharp(input, { limitInputPixels: 24_000_000, animated: false }).metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) !== 1) throw new Error("format");
    let result = await sharp(input, { limitInputPixels: 24_000_000 }).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 84 }).toBuffer({ resolveWithObject: true });
    if (result.data.length > MAX_IMAGE_BYTES) result = await sharp(result.data).jpeg({ quality: 65 }).toBuffer({ resolveWithObject: true });
    if (result.data.length > MAX_IMAGE_BYTES) throw new ServiceError(413, "image_too_large");
    return { bytes: result.data, width: result.info.width, height: result.info.height, contentType: "image/jpeg" };
  } catch (error) {
    if (isServiceError(error)) throw error;
    throw new ServiceError(400, "invalid_image");
  }
}
