/** Official public site origin for Schema.org `@id` and absolute URLs. */
export const CANONICAL_SITE_ORIGIN = "https://teatroalicia.com" as const

/** Normalized origin without a trailing slash (for `#fragment` entity ids). */
export function canonicalOrigin(): string {
  return CANONICAL_SITE_ORIGIN
}

/** Absolute canonical URL for a path (`/` → homepage with trailing slash). */
export function canonicalPageUrl(path = "/"): string {
  if (path === "/" || path === "") {
    return `${CANONICAL_SITE_ORIGIN}/`
  }
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${CANONICAL_SITE_ORIGIN}${normalized}`
}

/** Absolute asset URL under the canonical origin. */
export function canonicalAssetUrl(assetPath: string): string {
  const normalized = assetPath.startsWith("/") ? assetPath : `/${assetPath}`
  return `${CANONICAL_SITE_ORIGIN}${normalized}`
}