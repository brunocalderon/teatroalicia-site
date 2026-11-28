import { getUmamiPromoterEventData } from "@/lib/umami-referral-event-data"

export const UMAMI_CARTELERA_TICKET_EVENT = "Home Cartelera Ticket Click"
export const UMAMI_EVENT_PAGE_TICKET_EVENT = "Event Page Ticket Click"

export type UmamiCarteleraTicketPayload = {
  event_name: string
  event_id: string
}

type UmamiClient = {
  track: (eventName: string, data?: Record<string, string | boolean>) => void
}

export function trackUmamiCarteleraTicketClick(
  payload: UmamiCarteleraTicketPayload,
  umamiEventName: string = UMAMI_CARTELERA_TICKET_EVENT,
): void {
  if (typeof window === "undefined") {
    return
  }
  const umami = (window as Window & { umami?: UmamiClient }).umami
  if (!umami?.track) {
    return
  }

  const promoter = getUmamiPromoterEventData(
    new URLSearchParams(window.location.search),
  )

  const eventId = payload.event_id.trim()
  umami.track(umamiEventName, {
    event_name: payload.event_name,
    ...(eventId ? { event_id: eventId } : {}),
    ...(promoter
      ? {
          promoter_id: promoter.promoter_id,
          promoter_name: promoter.promoter_name,
          promoter_verified: promoter.promoter_verified,
        }
      : {}),
  })
}