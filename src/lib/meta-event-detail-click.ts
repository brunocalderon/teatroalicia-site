/** Meta Pixel `HomeCarteleraEventDetailClick` for home cartelera detail CTAs. */

export const META_EVENT_DETAIL_CLICK_EVENT = "HomeCarteleraEventDetailClick"

export type MetaEventDetailClickPayload = {
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

/** Pathname for Meta `destination` (relative or absolute event detail href). */
export function resolveEventDetailClickDestination(href: string): string {
  try {
    return new URL(href, "https://teatroalicia.com").pathname
  } catch {
    return href.trim()
  }
}

export function trackMetaEventDetailClick(
  payload: MetaEventDetailClickPayload,
): void {
  const fbq = getMetaFbq()
  if (!fbq) {
    return
  }
  fbq("trackCustom", META_EVENT_DETAIL_CLICK_EVENT, {
    content_name: payload.content_name,
    content_category: "event_detail",
    content_ids: payload.content_ids,
    destination: payload.destination,
  })
}