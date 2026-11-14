import { SITE_URL } from "astro:env/server"

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "")
}

function normalizeOrigin(raw: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`)
    return trimTrailingSlash(url.origin)
  } catch {
    return undefined
  }
}

/**
 * Canonical absolute site origin for build-time artifacts (referral CSV links).
 *
 * Prefer `SITE_URL` (your public custom domain in Cloudflare Pages).
 * Falls back to `CF_PAGES_URL` (Pages deployment URL, often `*.pages.dev`).
 */
export function resolveSiteOrigin(): string {
  const fromAstro = normalizeOrigin(SITE_URL)
  if (fromAstro) {
    return fromAstro
  }

  for (const key of ["SITE_URL", "PUBLIC_SITE_URL", "CF_PAGES_URL"] as const) {
    const fromProcess = normalizeOrigin(process.env[key] ?? "")
    if (fromProcess) {
      return fromProcess
    }
  }

  return "http://localhost:4321"
}