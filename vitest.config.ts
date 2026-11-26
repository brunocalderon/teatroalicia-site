import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@snapshots": path.resolve(__dirname, "./generated/snapshots"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    env: {
      AIRTABLE_LIVE_FETCH: "1",
    },
  },
})