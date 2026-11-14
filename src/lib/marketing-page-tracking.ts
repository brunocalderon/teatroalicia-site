/** Shared Meta / Umami page-view parameters (islaconcierge-site pattern). */

import { FACEBOOK_PIXEL_ID } from "astro:env/client"

import type { MetaPixelUserData } from "@/lib/meta-pixel-user-data"

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

export type TrackMetaCompleteRegistrationOptions = {
  userData?: MetaPixelUserData
}

/** Fires before Formgong POST so conversion is recorded even if navigation follows. */
export function trackMetaCompleteRegistration(
  tracking: MarketingPageTracking,
  options: TrackMetaCompleteRegistrationOptions = {}
): void {
  const fbq = getMetaFbq()
  const pixelId = FACEBOOK_PIXEL_ID.trim()
  if (!fbq || !pixelId) {
    return
  }

  const userData = options.userData
  if (userData && Object.keys(userData).length > 0) {
    // Manual advanced matching is attached via fbq("init") (not fbq("set", "userData")).
    // A second init updates matching for subsequent track calls.
    fbq("init", pixelId, userData)
  }

  fbq("track", "CompleteRegistration", buildMetaTrackingPayload(tracking))
}