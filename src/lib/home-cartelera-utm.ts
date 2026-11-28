import type { EventEntryData } from "@/lib/event-schema"

const UTM_SOURCE = "teatroalicia_site"
const UTM_MEDIUM = "referral"
const UTM_CONTENT = "home_event_list"

/** Guest-list closed **Comprar entradas** CTA (`utm_content`). */
export const GUEST_LIST_TICKET_UTM_CONTENT = "guest_list_ticket_cta"

/** Stable campaign slug for `utm_campaign` from event frontmatter. */
export function homeCarteleraEventSlug(
  data: Pick<EventEntryData, "eventId" | "slug">,
): string {
  const eventId = data.eventId?.trim()
  if (eventId) {
    const withoutPrefix = eventId.replace(/^teatro-alicia-/, "")
    const withoutDate = withoutPrefix.replace(/-\d{4}-\d{2}-\d{2}$/, "")
    if (withoutDate) {
      return withoutDate
    }
  }

  return data.slug.trim() || "event"
}

/** Appends home Cartelera UTM params to internal paths or absolute URLs. */
export function appendHomeCarteleraUtm(
  href: string,
  eventCampaign: string,
  utmContent: string = UTM_CONTENT,
): string {
  const trimmed = href.trim()
  const isAbsolute = /^https?:\/\//i.test(trimmed)
  const url = new URL(trimmed, isAbsolute ? undefined : "https://teatroalicia.com")

  url.searchParams.set("utm_source", UTM_SOURCE)
  url.searchParams.set("utm_medium", UTM_MEDIUM)
  url.searchParams.set("utm_campaign", eventCampaign)
  url.searchParams.set("utm_content", utmContent)

  if (isAbsolute) {
    return url.href
  }

  const search = url.search
  const hash = url.hash
  return `${url.pathname}${search}${hash}`
}