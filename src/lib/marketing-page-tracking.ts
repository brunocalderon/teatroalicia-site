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