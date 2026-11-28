import {
  resolveTicketCheckoutDestination,
  trackMetaTicketCheckoutClick,
} from "@/lib/meta-ticket-checkout"
import {
  UMAMI_CARTELERA_TICKET_EVENT,
  trackUmamiCarteleraTicketClick,
} from "@/lib/track-umami-cartelera-ticket"

export type CarteleraTicketCtaTrackingOptions = {
  umamiEventName?: string
}

const CARTELERA_TICKET_CTA_SELECTOR = "[data-cartelera-ticket-cta]"

type CarteleraTicketClickEvent = Event & {
  __metaTicketCheckoutTracked?: boolean
}

function handleCarteleraTicketClick(
  event: Event,
  umamiEventName: string,
): void {
  const clickEvent = event as CarteleraTicketClickEvent
  const target = (event.target as Element).closest<HTMLAnchorElement>(
    CARTELERA_TICKET_CTA_SELECTOR,
  )
  if (!target) {
    return
  }
  const eventName = target.dataset.eventTitle ?? ""
  const eventId = target.dataset.eventId?.trim() ?? ""
  trackUmamiCarteleraTicketClick(
    {
      event_name: eventName,
      event_id: eventId,
    },
    umamiEventName,
  )

  if (clickEvent.__metaTicketCheckoutTracked) {
    return
  }
  clickEvent.__metaTicketCheckoutTracked = true

  const contentId =
    target.dataset.ticketContentId?.trim() ||
    target.dataset.eventId?.trim() ||
    target.dataset.eventCampaign ||
    "event"
  trackMetaTicketCheckoutClick({
    content_name: eventName,
    content_ids: [contentId],
    destination: resolveTicketCheckoutDestination(
      target.href,
      target.dataset.ticketSupplier,
    ),
  })
}

/** Delegated Meta + Umami tracking for cartelera ticket outbound links. */
export function initCarteleraTicketCtaTracking(
  root: ParentNode,
  options?: CarteleraTicketCtaTrackingOptions,
): void {
  const umamiEventName =
    options?.umamiEventName ?? UMAMI_CARTELERA_TICKET_EVENT
  root.addEventListener("click", (event) => {
    handleCarteleraTicketClick(event, umamiEventName)
  })
}