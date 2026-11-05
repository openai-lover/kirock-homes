/** Initialize retention cleanup when the Node server starts, including after downtime. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
    const { getStore } = await import("./lib/server/share-store");
    getStore();
  }
}
