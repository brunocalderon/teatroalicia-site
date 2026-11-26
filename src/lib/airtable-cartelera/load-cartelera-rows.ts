import {
  carteleraEventsSnapshotMissingMessage,
  readCarteleraEventsBuildCache,
  readCarteleraEventsSnapshot,
} from "@/lib/airtable-cartelera/cartelera-events-snapshot"
import {
  fetchAirtableCarteleraRows,
  type FetchAirtableCarteleraConfig,
} from "@/lib/airtable-cartelera/fetch-events"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

/**
 * Home cartelera and guest-list routes: dev snapshot; `astro build` reads one build cache.
 */
export async function loadAirtableCarteleraRows(
  config: FetchAirtableCarteleraConfig,
): Promise<AirtableCarteleraRow[]> {
  if (import.meta.env.DEV) {
    const snapshot = readCarteleraEventsSnapshot()
    if (snapshot === null) {
      throw new Error(carteleraEventsSnapshotMissingMessage)
    }
    return snapshot
  }

  const buildCache = readCarteleraEventsBuildCache()
  if (buildCache !== null) {
    return buildCache
  }

  // Fallback when cartelera env is set but the build plugin did not run (e.g. unusual tooling).
  return fetchAirtableCarteleraRows(config)
}