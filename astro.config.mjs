// @ts-check
import path from "node:path"
import { fileURLToPath } from "node:url"

import react from "@astrojs/react"
import { defineConfig, envField } from "astro/config"

import tailwindcss from "@tailwindcss/vite";

import { carteleraPostersIntegration } from "./src/integrations/cartelera-posters.ts"
import { contentSecurityPolicyIntegration } from "./src/integrations/content-security-policy.ts"
import { cspDevServerPlugin } from "./src/integrations/csp-dev-server.ts"
import { deferCssIntegration } from "./src/integrations/defer-css.ts"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://astro.build/config
export default defineConfig({
  /** Lossless HTML minification on `astro build` (JS/CSS via Vite below). */
  compressHTML: true,

  integrations: [
    carteleraPostersIntegration(),
    react(),
    deferCssIntegration(),
    contentSecurityPolicyIntegration(),
  ],

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
      /** Ms after `window` `load` before Meta/Umami on any page with marketing `tracking` (home, forms, 404, thank-you). */
      MARKETING_ENGAGE_MS: envField.number({
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
      /** Public origin (e.g. https://teatroalicia.com) for build-time artifacts (`llms.txt`, `ard.json`). */
      SITE_URL: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Instagram handle (optional) for the follow button on form thank-you pages. */
      THANK_YOU_INSTAGRAM_USERNAME: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Personal access token with data.records:read (home cartelera at build). */
      AIRTABLE_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        default: "",
      }),
      /** Airtable base ID. */
      AIRTABLE_BASE_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Home cartelera table (defaults via `AIRTABLE_CARTELERA_TABLE_ID`). */
      AIRTABLE_TABLE_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Home cartelera table (defaults to `AIRTABLE_TABLE_ID` when unset). */
      AIRTABLE_CARTELERA_TABLE_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Optional Airtable view (`viw…`) for home cartelera list requests. */
      AIRTABLE_CARTELERA_VIEW_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Promoters table for guest-pass roster (build snapshot). */
      AIRTABLE_PROMOTERS_TABLE_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Optional Airtable view for promoters list requests. */
      AIRTABLE_PROMOTERS_VIEW_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
        default: "",
      }),
      /** Formgong access_key for all Airtable guest-list forms (`/i/:slug`). */
      AIRTABLE_INVITATION_FORM_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        default: "",
      }),
    },
  },

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@snapshots": path.resolve(__dirname, "./generated/snapshots"),
      },
    },

    plugins: [tailwindcss(), cspDevServerPlugin()],

    build: {
      /** Production client bundles only (`astro build`); dev stays unminified. */
      minify: "esbuild",
      cssMinify: "esbuild",
      assetsInlineLimit: (filePath) => {
        if (filePath.includes("livestack-logo-white.")) {
          return false
        }
      },
    },
  },
})