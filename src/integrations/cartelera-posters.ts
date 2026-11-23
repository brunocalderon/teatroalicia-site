import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"
import type { Plugin } from "vite"
import { loadEnv } from "vite"

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

      const fileEnv = loadEnv(mode, root, "")
      const carteleraConfig = resolveAirtableCarteleraConfigFromValues({
        ...process.env,
        ...fileEnv,
      })
      if (!carteleraConfig) {
        return
      }

      const count = await syncCarteleraPostersFromAirtable(carteleraConfig)
      this.info(
        `Mirrored ${count} cartelera poster(s) to src/.cache/cartelera-posters/`,
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