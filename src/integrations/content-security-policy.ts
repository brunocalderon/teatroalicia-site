import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import type { AstroIntegration } from "astro"

import {
  CLOUDFLARE_PAGES_MAX_HEADER_LINE_LENGTH,
  CONTENT_SECURITY_POLICY,
  CSP_HEADERS_LINE_PREFIX,
  contentSecurityPolicyHeaderLineLength,
} from "@/lib/content-security-policy"

const CSP_HEADER_LINE = `${CSP_HEADERS_LINE_PREFIX}${CONTENT_SECURITY_POLICY}`

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

        const cspLineLength = contentSecurityPolicyHeaderLineLength()
        if (cspLineLength > CLOUDFLARE_PAGES_MAX_HEADER_LINE_LENGTH) {
          throw new Error(
            `Content-Security-Policy _headers line is ${cspLineLength} chars; ` +
              `Cloudflare Pages max is ${CLOUDFLARE_PAGES_MAX_HEADER_LINE_LENGTH}. ` +
              "Trim src/lib/content-security-policy.ts connect-src allowlists.",
          )
        }

        await writeFile(headersPath, block, "utf8")
        logger.info("Wrote Content-Security-Policy to dist/_headers.")
      },
    },
  }
}