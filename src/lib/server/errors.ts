// Next.js emits instrumentation and route handlers in separate bundles. A
// process-global store can therefore throw an Error from a different copy of
// this module; constructor identity (`instanceof`) is not a reliable boundary.
const SERVICE_ERROR_TAG = Symbol.for("room-of-suspects.service-error.v1");

export class ServiceError extends Error {
  readonly [SERVICE_ERROR_TAG] = true;
  constructor(public status: number, public code: string) {
    super(code);
    this.name = "ServiceError";
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  if (!error || typeof error !== "object") return false;
  const value = error as Record<PropertyKey, unknown>;
  return value[SERVICE_ERROR_TAG] === true
    && Number.isInteger(value.status)
    && Number(value.status) >= 400 && Number(value.status) <= 599
    && typeof value.code === "string" && /^[a-z][a-z0-9_]{0,79}$/.test(value.code);
}
