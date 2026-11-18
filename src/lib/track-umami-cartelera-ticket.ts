import { getUmamiPromoterEventData } from "@/lib/umami-referral-event-data"

export const UMAMI_CARTELERA_TICKET_EVENT = "Home Cartelera Ticket Click"

export type UmamiCarteleraTicketPayload = {
  event_title: string
  event_id: string
}

type UmamiClient = {
  track: (eventName: string, data?: Record<string, string | boolean>) => void
}

export function trackUmamiCarteleraTicketClick(
  payload: UmamiCarteleraTicketPayload,
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

  umami.track(UMAMI_CARTELERA_TICKET_EVENT, {
    event_title: payload.event_title,
    event_id: payload.event_id,
    ...(promoter
      ? {
          promoter_id: promoter.promoter_id,
          promoter_name: promoter.promoter_name,
          promoter_verified: promoter.promoter_verified,
        }
      : {}),
  })
}