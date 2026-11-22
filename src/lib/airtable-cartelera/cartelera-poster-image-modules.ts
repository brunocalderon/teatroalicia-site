import { readdir } from "node:fs/promises"
import path from "node:path"
import type { ImageMetadata } from "astro"

import { CARTELERA_POSTER_CACHE_DIR } from "@/lib/airtable-cartelera/cartelera-poster-cache-path"

/**
 * Importers for files that existed when Vite first scanned the cache directory.
 * Posters mirrored later (dev / first build) are loaded via dynamic import below.
 */
const cachedPosterImporters = import.meta.glob<ImageMetadata>(
  "../../.cache/cartelera-posters/*.{apng,avif,gif,jpg,jpeg,png,webp}",
  { import: "default" },
)

const globKeyForFile = (fileName: string) =>
  `../../.cache/cartelera-posters/${fileName}`

let posterFileNameBySlug: Map<string, string> | undefined

export function resetCarteleraPosterFileIndex(): void {
  posterFileNameBySlug = undefined
}

async function listPosterFileNamesBySlug(): Promise<Map<string, string>> {
  if (posterFileNameBySlug) {
    return posterFileNameBySlug
  }

  posterFileNameBySlug = new Map()
  let entries: string[]
  try {
    entries = await readdir(CARTELERA_POSTER_CACHE_DIR)
  } catch {
    return posterFileNameBySlug
  }

  for (const entry of entries) {
    const slug = path.basename(entry, path.extname(entry))
    if (slug) {
      posterFileNameBySlug.set(slug, entry)
    }
  }

  return posterFileNameBySlug
}

export async function carteleraPosterImageBySlug(
  slug: string,
): Promise<ImageMetadata | undefined> {
  const fileIndex = await listPosterFileNamesBySlug()
  const fileName = fileIndex.get(slug)
  if (!fileName) {
    return undefined
  }

  const globKey = globKeyForFile(fileName)
  const fromGlob = cachedPosterImporters[globKey]
  if (fromGlob) {
    return fromGlob()
  }

  try {
    const mod = await import(
      /* @vite-ignore */
      `../../.cache/cartelera-posters/${fileName}`
    )
    return mod.default as ImageMetadata
  } catch {
    return undefined
  }
}