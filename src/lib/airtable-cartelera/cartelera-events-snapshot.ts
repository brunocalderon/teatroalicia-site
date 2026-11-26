import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"

/** Committed or locally synced cartelera rows for `astro dev`. */
export const CARTELERA_EVENTS_SNAPSHOT_PATH = path.join(
  process.cwd(),
  "generated",
  "snapshots",
  "cartelera.events.json",
)

/** Ephemeral cache from the single Airtable list during `astro build` (gitignored). */
export const CARTELERA_EVENTS_BUILD_CACHE_PATH = path.join(
  process.cwd(),
  "generated",
  "cache",
  "cartelera.events.json",
)

function parseCarteleraEventsJsonFile(
  raw: string,
  filePath: string,
): AirtableCarteleraRow[] {
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error(
      `Invalid cartelera events JSON at ${filePath}: expected a JSON array.`,
    )
  }
  return parsed as AirtableCarteleraRow[]
}

function readCarteleraEventsFromPath(
  filePath: string,
): AirtableCarteleraRow[] | null {
  if (!existsSync(filePath)) {
    return null
  }
  const raw = readFileSync(filePath, "utf8")
  return parseCarteleraEventsJsonFile(raw, filePath)
}

export function readCarteleraEventsSnapshot(): AirtableCarteleraRow[] | null {
  return readCarteleraEventsFromPath(CARTELERA_EVENTS_SNAPSHOT_PATH)
}

export function readCarteleraEventsBuildCache(): AirtableCarteleraRow[] | null {
  return readCarteleraEventsFromPath(CARTELERA_EVENTS_BUILD_CACHE_PATH)
}

function writeCarteleraEventsToPath(
  filePath: string,
  rows: AirtableCarteleraRow[],
): void {
  writeFileSync(filePath, `${JSON.stringify(rows, null, 2)}\n`)
}

export function writeCarteleraEventsSnapshot(
  rows: AirtableCarteleraRow[],
): void {
  writeCarteleraEventsToPath(CARTELERA_EVENTS_SNAPSHOT_PATH, rows)
}

export function writeCarteleraEventsBuildCache(
  rows: AirtableCarteleraRow[],
): void {
  writeCarteleraEventsToPath(CARTELERA_EVENTS_BUILD_CACHE_PATH, rows)
}

export const carteleraEventsSnapshotMissingMessage = `Missing ${CARTELERA_EVENTS_SNAPSHOT_PATH}. Run \`npm run sync:airtable\` with Airtable env set.`