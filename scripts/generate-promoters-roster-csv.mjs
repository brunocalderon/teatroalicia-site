import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const columns = [
  "id",
  "name",
  "active",
  "ticket_sale_enabled",
  "guest_pass_enabled",
]

function escapeCsvCell(value) {
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const rosterPath = path.join(root, "generated", "snapshots", "promoters.roster.json")
const outPath = path.join(root, "content", "promoters.roster.csv")

/** @type {import("../src/lib/promoters-roster-types.ts").PromoterRosterEntry[]} */
const promotersRoster = JSON.parse(readFileSync(rosterPath, "utf8"))

const sorted = [...promotersRoster].sort((a, b) =>
  a.name.localeCompare(b.name, "es"),
)

const header = columns.map(escapeCsvCell).join(",")
const rows = sorted.map((promoter) =>
  columns.map((column) => escapeCsvCell(promoter[column])).join(","),
)

writeFileSync(outPath, `${[header, ...rows].join("\n")}\n`)

console.log(`Wrote ${sorted.length} promoters to content/promoters.roster.csv`)