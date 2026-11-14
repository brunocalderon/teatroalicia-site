import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"

import { CONTENT_SECURITY_POLICY } from "@/lib/content-security-policy"

const CSP_HEADER_LINE = `  Content-Security-Policy: ${CONTENT_SECURITY_POLICY}`

function stripExistingSiteWideCsp(headers: string): string {
  return headers.replace(
    /\n\/\*\n(?:[^\n]*\n)*?  Content-Security-Policy:[^\n]*\n/g,
    "\n",
  )
}

/** Append site-wide CSP to `dist/_headers` after the static copy from `public/`. */
export function contentSecurityPolicyIntegration(): AstroIntegration {
  return {
    name: "teatroalicia-content-security-policy",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir)
        const headersPath = path.join(distDir, "_headers")

        let existing = ""
        try {
          existing = await readFile(headersPath, "utf8")
        } catch {
          // `public/_headers` may be absent
        }

        const withoutCsp = stripExistingSiteWideCsp(existing).trimEnd()
        const block = withoutCsp
          ? `${withoutCsp}\n\n/*\n${CSP_HEADER_LINE}\n`
          : `/*\n${CSP_HEADER_LINE}\n`

        await writeFile(headersPath, block, "utf8")
        logger.info("Wrote Content-Security-Policy to dist/_headers.")
      },
    },
  }
}