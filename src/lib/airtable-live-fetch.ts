/** When set, allows live `api.airtable.com` calls (sync scripts, Vitest). */
export function isAirtableLiveFetchEnabled(): boolean {
  return process.env.AIRTABLE_LIVE_FETCH === "1"
}

/**
 * Live Airtable REST calls are only for build (`astro build`), explicit sync, and tests.
 * The deployed site is static — no runtime server should reach the API.
 */
export function assertAirtableApiCallAllowed(): void {
  if (typeof window !== "undefined") {
    throw new Error("Airtable API calls are not allowed in the browser.")
  }

  if (isAirtableLiveFetchEnabled()) {
    return
  }

  // `astro dev` sets import.meta.env.DEV — use snapshots instead of live API.
  if (import.meta.env?.DEV) {
    throw new Error(
      "Live Airtable API is disabled in dev. Run `npm run sync:airtable` to refresh cartelera snapshots and posters.",
    )
  }
}