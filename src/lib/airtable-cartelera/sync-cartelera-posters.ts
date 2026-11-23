import { readdir, rm } from "node:fs/promises"
import path from "node:path"

import { CARTELERA_POSTER_CACHE_DIR } from "@/lib/airtable-cartelera/cartelera-poster-cache-path"
import { resetCarteleraPosterFileIndex } from "@/lib/airtable-cartelera/cartelera-poster-image-modules"
import { fetchAirtableCarteleraRows } from "@/lib/airtable-cartelera/fetch-events"
import { mirrorAirtableCarteleraPoster } from "@/lib/airtable-cartelera/mirror-cartelera-poster"
import type { AirtableCarteleraEnvValues } from "@/lib/airtable-env-values"

export async function syncCarteleraPostersFromAirtable(
  config: AirtableCarteleraEnvValues,
): Promise<number> {
  const rows = await fetchAirtableCarteleraRows(config)
  const activeSlugs = new Set<string>()

  await Promise.all(
    rows.map(async (row) => {
      const remoteUrl = row.imageUrl?.trim()
      if (!remoteUrl) {
        return
      }
      const mirrored = await mirrorAirtableCarteleraPoster(
        row.slug,
        remoteUrl,
        row.imageFilename,
      )
      if (mirrored) {
        activeSlugs.add(row.slug)
      }
    }),
  )

  await pruneStaleCarteleraPosterCache(activeSlugs)
  resetCarteleraPosterFileIndex()
  return activeSlugs.size
}

async function pruneStaleCarteleraPosterCache(
  activeSlugs: ReadonlySet<string>,
): Promise<void> {
  let entries: string[]
  try {
    entries = await readdir(CARTELERA_POSTER_CACHE_DIR)
  } catch {
    return
  }

  await Promise.all(
    entries.map(async (entry) => {
      const slug = path.basename(entry, path.extname(entry))
      if (!activeSlugs.has(slug)) {
        await rm(path.join(CARTELERA_POSTER_CACHE_DIR, entry), { force: true })
      }
    }),
  )
}