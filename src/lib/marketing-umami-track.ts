import { getUmamiPromoterEventData } from "@/lib/umami-referral-event-data"

declare global {
  interface Window {
    __umamiPromoterEventData?: () =>
      | ReturnType<typeof getUmamiPromoterEventData>
      | undefined
  }
}

export function bindUmamiPromoterEventDataResolver(): void {
  window.__umamiPromoterEventData = () =>
    getUmamiPromoterEventData(new URLSearchParams(window.location.search))
}