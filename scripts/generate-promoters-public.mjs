import { writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { promotersRoster } from "../src/config/promoters.roster.ts"

const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "config",
  "promoters.public.json"
)

const publicPromoters = promotersRoster
  .filter((p) => p.active && p.guest_pass_enabled)
  .map(({ id, name }) => ({ id, name }))

writeFileSync(outPath, `${JSON.stringify(publicPromoters, null, 2)}\n`)

console.log(
  `Wrote ${publicPromoters.length} guest-pass promoters to src/config/promoters.public.json`
)