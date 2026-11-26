import path from "node:path"
import { fileURLToPath } from "node:url"

import { loadEnv } from "vite"

process.env.AIRTABLE_LIVE_FETCH = "1"

import { writeCarteleraEventsSnapshot } from "../src/lib/airtable-cartelera/cartelera-events-snapshot.ts"
import { fetchAirtableCarteleraRows } from "../src/lib/airtable-cartelera/fetch-events.ts"
import { syncCarteleraPostersFromAirtable } from "../src/lib/airtable-cartelera/sync-cartelera-posters.ts"
import { resolveAirtableCarteleraConfigFromValues } from "../src/lib/airtable-env-values.ts"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const mode = process.env.NODE_ENV ?? "development"
const fileEnv = loadEnv(mode, root, "")
const env = { ...process.env, ...fileEnv }

const carteleraConfig = resolveAirtableCarteleraConfigFromValues(env)
if (!carteleraConfig) {
  throw new Error(
    "Set AIRTABLE_TOKEN, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_ID (or AIRTABLE_CARTELERA_TABLE_ID) to sync cartelera.",
  )
}

const rows = await fetchAirtableCarteleraRows(carteleraConfig)
writeCarteleraEventsSnapshot(rows)
console.log(
  `Wrote ${rows.length} cartelera row(s) → generated/snapshots/cartelera.events.json`,
)

const posterCount = await syncCarteleraPostersFromAirtable(carteleraConfig, rows)
console.log(
  `Mirrored ${posterCount} cartelera poster(s) to generated/cache/cartelera-posters/`,
)