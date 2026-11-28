import { getUmamiPromoterEventData } from "@/lib/umami-referral-event-data"

export const UMAMI_HOME_CARTELERA_EVENT_DETAIL_EVENT =
  "Home Cartelera Event Detail Click"

export type UmamiCarteleraEventDetailPayload = {
  event_name: string
  event_id: string
}

type UmamiClient = {
  track: (eventName: string, data?: Record<string, string | boolean>) => void
}

export function trackUmamiCarteleraEventDetailClick(
  payload: UmamiCarteleraEventDetailPayload,
  umamiEventName: string = UMAMI_HOME_CARTELERA_EVENT_DETAIL_EVENT,
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