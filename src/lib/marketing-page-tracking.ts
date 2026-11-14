/** Shared Meta / Umami page-view parameters (islaconcierge-site pattern). */

export const MARKETING_TRACKING_CITY = "Santiago"

export type MarketingPageTracking = {
  contentName: string
  contentCategory: string
  pageType: string
  city?: string
  metaEvent?: "ViewContent" | "Lead"
  /** Defaults to `contentName` when omitted. */
  umamiEventName?: string
}

export const marketingPageTracking = {
  home: {
    contentName: "Teatro Alicia",
    contentCategory: "Marketing",
    pageType: "Landing Teatro Alicia",
  },
  thankYou: {
    contentName: "Invitation Received",
    contentCategory: "Event Invitation",
    pageType: "Thank You",
    metaEvent: "Lead",
    umamiEventName: "Invitation Received",
  },
} as const satisfies Record<string, MarketingPageTracking>

export function invitationFormTracking(contentName: string): MarketingPageTracking {
  return {
    contentName,
    contentCategory: "Event Invitation",
    pageType: "Invitation Form",
  }
}

export function buildMetaTrackingPayload(
  tracking: MarketingPageTracking
): Record<string, string> {
  return {
    content_name: tracking.contentName,
    content_category: tracking.contentCategory,
    city: tracking.city ?? MARKETING_TRACKING_CITY,
    page_type: tracking.pageType,
  }
}

type Fbq = (...args: unknown[]) => void

function getMetaFbq(): Fbq | undefined {
  if (typeof window === "undefined") {
    return undefined
  }
  const fbq = (window as Window & { fbq?: Fbq }).fbq
  return typeof fbq === "function" ? fbq : undefined
}

/** Fires before Formgong POST so conversion is recorded even if navigation follows. */
export function trackMetaCompleteRegistration(
  tracking: MarketingPageTracking
): void {
  const fbq = getMetaFbq()
  if (!fbq) {
    return
  }
  fbq("track", "CompleteRegistration", buildMetaTrackingPayload(tracking))
}