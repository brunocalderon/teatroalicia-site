import {
  resolveEventDetailClickDestination,
  trackMetaEventDetailClick,
} from "@/lib/meta-event-detail-click"
import { trackUmamiCarteleraEventDetailClick } from "@/lib/track-umami-cartelera-event-detail"

const CARTELERA_EVENT_DETAIL_CTA_SELECTOR =
  "[data-cartelera-event-detail-cta]"

type CarteleraEventDetailClickEvent = Event & {
  __metaEventDetailClickTracked?: boolean
}

function handleCarteleraEventDetailClick(event: Event): void {
  const clickEvent = event as CarteleraEventDetailClickEvent
  const target = (event.target as Element).closest<HTMLAnchorElement>(
    CARTELERA_EVENT_DETAIL_CTA_SELECTOR,
  )
  if (!target) {
    return
  }
  const eventName = target.dataset.eventTitle ?? ""
  const eventId = target.dataset.eventId?.trim() ?? ""
  trackUmamiCarteleraEventDetailClick({
    event_name: eventName,
    event_id: eventId,
  })

  if (clickEvent.__metaEventDetailClickTracked) {
    return
  }
  clickEvent.__metaEventDetailClickTracked = true

  const contentId =
    target.dataset.ticketContentId?.trim() ||
    target.dataset.eventId?.trim() ||
    target.dataset.eventCampaign ||
    "event"
  trackMetaEventDetailClick({
    content_name: eventName,
    content_ids: [contentId],
    destination: resolveEventDetailClickDestination(target.href),
  })
}

/** Delegated Meta + Umami tracking for home cartelera “Más información” links. */
export function initCarteleraEventDetailCtaTracking(root: ParentNode): void {
  root.addEventListener("click", handleCarteleraEventDetailClick)
}