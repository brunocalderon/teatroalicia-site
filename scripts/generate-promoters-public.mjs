import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { loadEnv } from "vite"

import { fetchAirtablePromotersRows } from "../src/lib/airtable-promoters/fetch-promoters.ts"
import { resolveAirtablePromotersConfigFromValues } from "../src/lib/airtable-env-values.ts"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const generatedDir = path.join(root, "src", "generated")
const rosterPath = path.join(generatedDir, "promoters.roster.json")
const publicPath = path.join(generatedDir, "promoters.public.json")

const mode = process.env.NODE_ENV ?? "development"
const fileEnv = loadEnv(mode, root, "")
const env = { ...process.env, ...fileEnv }

/** @type {import("../src/lib/promoters-roster-types.ts").PromoterRosterEntry[]} */
let roster

const airtableConfig = resolveAirtablePromotersConfigFromValues(env)
if (airtableConfig) {
  roster = await fetchAirtablePromotersRows(airtableConfig)
  roster.sort((a, b) => a.name.localeCompare(b.name, "es"))
  writeFileSync(rosterPath, `${JSON.stringify(roster, null, 2)}\n`)
  console.log(
    `Fetched ${roster.length} promoters from Airtable → src/generated/promoters.roster.json`,
  )
} else if (existsSync(rosterPath)) {
  roster = JSON.parse(readFileSync(rosterPath, "utf8"))
  console.log(
    `Airtable promoters env unset; using existing src/generated/promoters.roster.json (${roster.length} rows)`,
  )
} else {
  throw new Error(
    "Set AIRTABLE_TOKEN, AIRTABLE_BASE_ID, and AIRTABLE_PROMOTERS_TABLE_ID, or commit src/generated/promoters.roster.json",
  )
}

const publicPromoters = roster
  .filter((promoter) => promoter.active && promoter.guest_pass_enabled)
  .map(({ id, name }) => ({ id, name }))

writeFileSync(publicPath, `${JSON.stringify(publicPromoters, null, 2)}\n`)

console.log(
  `Wrote ${publicPromoters.length} guest-pass promoters to src/generated/promoters.public.json`,
)