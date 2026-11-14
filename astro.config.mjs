// @ts-check
import path from "node:path"
import { fileURLToPath } from "node:url"

import react from "@astrojs/react"
import { defineConfig, envField } from "astro/config"

import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  devToolbar: {
    enabled: false,
  },

  env: {
    schema: {
      /** Required when any markdown form includes a `file` field. */
      CLOUDFLARE_TURNSTILE_SITE_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "",
      }),
      FACEBOOK_PIXEL_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "",
      }),
      UMAMI_PIXEL_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Public origin (e.g. https://teatroalicia.cl) for referral CSV links at build time. */
      SITE_URL: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
    },
  },

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    plugins: [tailwindcss()],

  build: {
      assetsInlineLimit: (filePath) => {
        if (filePath.includes("livestack-logo-white.svg")) {
          return false
        }
      },
    },
  },
})