// @ts-check
import path from "node:path"
import { fileURLToPath } from "node:url"

import react from "@astrojs/react"
import { defineConfig, envField } from "astro/config"

import tailwindcss from "@tailwindcss/vite";

import { deferCssIntegration } from "./src/integrations/defer-css.ts"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
  integrations: [react(), deferCssIntegration()],

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
      /** Ms after `window` `load` before Meta/Umami on invitation form routes (`/i/...`). */
      INVITATION_FORM_MARKETING_ENGAGE_MS: envField.number({
        context: "client",
        access: "public",
        optional: true,
        default: 1000,
        min: 0,
        int: true,
      }),
      /** `requestIdleCallback` timeout when pixels load after first user interaction. */
      MARKETING_INTERACTION_IDLE_TIMEOUT_MS: envField.number({
        context: "client",
        access: "public",
        optional: true,
        default: 2000,
        min: 0,
        int: true,
      }),
      /** City sent in Meta `content` payloads (`city` custom parameter). */
      MARKETING_TRACKING_CITY: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "Santiago",
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