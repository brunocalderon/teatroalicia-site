import type { FormEntryData } from "@/lib/form-schema"

const UTM_SOURCE = "teatroalicia_site"
const UTM_MEDIUM = "referral"
const UTM_CONTENT = "homepage_event_list"

/** Stable slug for `utm_campaign` from form frontmatter. */
export function carteleraUtmCampaignSlug(
  data: Pick<FormEntryData, "eventId" | "path">,
): string {
  const eventId = data.eventId?.trim()
  if (eventId) {
    return eventId
  }
  const fromPath = data.path.replace(/^\//, "").replaceAll("/", "-").trim()
  return fromPath || "event"
}

/**
 * Appends cartelera UTM params. Preserves relative paths for same-site links.
 */
export function appendCarteleraUtm(href: string, campaignSlug: string): string {
  const params = new URLSearchParams({
    utm_source: UTM_SOURCE,
    utm_medium: UTM_MEDIUM,
    utm_campaign: campaignSlug,
    utm_content: UTM_CONTENT,
  })

  const isRelative = href.startsWith("/") && !href.startsWith("//")
  const base = isRelative ? "https://teatroalicia.com" : undefined

  let url: URL
  try {
    url = new URL(href, base ?? href)
  } catch {
    const separator = href.includes("?") ? "&" : "?"
    return `${href}${separator}${params.toString()}`
  }

  for (const [key, value] of params) {
    url.searchParams.set(key, value)
  }

  if (isRelative) {
    return `${url.pathname}${url.search}${url.hash}`
  }

  return url.href
}