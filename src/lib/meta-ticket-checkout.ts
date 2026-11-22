/** Meta Pixel `TicketingOutboundClick` for external ticket CTAs. */

const EVENT_ID_DATE_SUFFIX = /-(\d{4}-\d{2}-\d{2})$/

/** Stable `content_ids` entry: `{slug}-{YYYY-MM-DD}` when eventId carries a date. */
export function metaTicketCheckoutContentId(options: {
  eventId?: string
  slug: string
}): string {
  const slug = options.slug.trim()
  const eventId = options.eventId?.trim()
  if (eventId && slug) {
    const date = eventId.match(EVENT_ID_DATE_SUFFIX)?.[1]
    if (date) {
      return `${slug}-${date}`
    }
  }
  return slug || eventId || "event"
}

/** Short platform label from ticket URL hostname (e.g. passline.com → passline). */
export function resolveTicketPlatformDestination(href: string): string {
  try {
    const host = new URL(href).hostname.toLowerCase().replace(/^www\./, "")
    if (host.includes("passline")) {
      return "passline"
    }
    return host.split(".")[0] ?? "external"
  } catch {
    return "external"
  }
}

export const META_TICKETING_OUTBOUND_CLICK_EVENT = "TicketingOutboundClick"

export type MetaTicketCheckoutClickPayload = {
  content_name: string
  content_ids: string[]
  destination: string
}

type Fbq = (...args: unknown[]) => void

function getMetaFbq(): Fbq | undefined {
  if (typeof window === "undefined") {
    return undefined
  }
  const fbq = (window as Window & { fbq?: Fbq }).fbq
  return typeof fbq === "function" ? fbq : undefined
}

export function trackMetaTicketCheckoutClick(
  payload: MetaTicketCheckoutClickPayload,
): void {
  const fbq = getMetaFbq()
  if (!fbq) {
    return
  }
  fbq("trackCustom", META_TICKETING_OUTBOUND_CLICK_EVENT, {
    content_name: payload.content_name,
    content_category: "event_ticket",
    content_ids: payload.content_ids,
    destination: payload.destination,
    currency: "CLP",
  })
}