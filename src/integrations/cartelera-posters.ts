import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"
import type { Plugin } from "vite"
import { loadEnv } from "vite"

import { writeCarteleraEventsBuildCache } from "../lib/airtable-cartelera/cartelera-events-snapshot"
import { fetchAirtableCarteleraRows } from "../lib/airtable-cartelera/fetch-events"
import { syncCarteleraPostersFromAirtable } from "../lib/airtable-cartelera/sync-cartelera-posters"
import { resolveAirtableCarteleraConfigFromValues } from "../lib/airtable-env-values"

const INTEGRATION_NAME = "teatroalicia-cartelera-posters"

function carteleraPosterSyncPlugin(root: string, mode: string): Plugin {
  let synced = false

  return {
    name: INTEGRATION_NAME,
    async buildStart() {
      if (synced) {
        return
      }
      synced = true

      // Poster mirroring uses live Airtable — production builds only (`astro build`).
      if (mode !== "production") {
        return
      }

      const fileEnv = loadEnv(mode, root, "")
      const carteleraConfig = resolveAirtableCarteleraConfigFromValues({
        ...process.env,
        ...fileEnv,
      })
      if (!carteleraConfig) {
        return
      }

      const rows = await fetchAirtableCarteleraRows(carteleraConfig)
      writeCarteleraEventsBuildCache(rows)
      const count = await syncCarteleraPostersFromAirtable(
        carteleraConfig,
        rows,
      )
      this.info(
        `Cached ${rows.length} cartelera row(s) and mirrored ${count} poster(s) for build`,
      )
    },
  }
}

export function carteleraPostersIntegration(): AstroIntegration {
  return {
    name: INTEGRATION_NAME,
    hooks: {
      "astro:config:setup": ({ config, updateConfig }) => {
        const root = fileURLToPath(config.root)
        updateConfig({
          vite: {
            plugins: [
              carteleraPosterSyncPlugin(
                root,
                process.env.NODE_ENV === "production"
                  ? "production"
                  : "development",
              ),
            ],
          },
        })
      },
    },
  }
}