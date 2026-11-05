/** Initialize retention cleanup when the Node server starts, including after downtime. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getStore } = await import("./lib/server/share-store");
    getStore();
  }
}
