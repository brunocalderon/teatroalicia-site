import { getUmamiPromoterEventData } from "@/lib/umami-referral-event-data"

export const UMAMI_LIVESTACK_BADGE_CLICK_EVENT = "Powered By Badge Click"

type UmamiClient = {
  track: (eventName: string, data?: Record<string, string | boolean>) => void
}

export function trackUmamiLivestackBadgeClick(): void {
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

  umami.track(UMAMI_LIVESTACK_BADGE_CLICK_EVENT, {
    page_path: window.location.pathname,
    ...(promoter
      ? {
          promoter_id: promoter.promoter_id,
          promoter_name: promoter.promoter_name,
          promoter_verified: promoter.promoter_verified,
        }
      : {}),
  })
}