/** Shared Meta / Umami page-view parameters (islaconcierge-site pattern). */

import { FACEBOOK_PIXEL_ID, MARKETING_TRACKING_CITY } from "astro:env/client"

import type { MetaPixelUserData } from "@/lib/meta-pixel-user-data"
import {
  consumePendingMetaPixelUserData,
  persistMetaPixelUserData,
} from "@/lib/meta-pixel-pending-storage"

export { MARKETING_TRACKING_CITY }

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
    umamiEventName: "Home Visit",
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

function attachMetaAdvancedMatching(userData: MetaPixelUserData | undefined): void {
  const fbq = getMetaFbq()
  const pixelId = FACEBOOK_PIXEL_ID.trim()
  if (!fbq || !pixelId || !userData || Object.keys(userData).length === 0) {
    return
  }
  fbq("init", pixelId, userData)
}

/** Form submit: persist PII and fire Lead before Formgong POST. */
export function trackMetaLead(
  tracking: MarketingPageTracking,
  userData: MetaPixelUserData
): void {
  const fbq = getMetaFbq()
  if (!fbq) {
    return
  }
  persistMetaPixelUserData(userData)
  fbq("track", "Lead", buildMetaTrackingPayload(tracking))
}

/** Thank-you page: init advanced matching from storage and fire CompleteRegistration once. */
export function trackMetaCompleteRegistrationFromPendingStorage(
  tracking: MarketingPageTracking
): void {
  const fbq = getMetaFbq()
  if (!fbq) {
    return
  }
  const userData = consumePendingMetaPixelUserData()
  if (!userData) {
    return
  }
  attachMetaAdvancedMatching(userData)
  fbq("track", "CompleteRegistration", buildMetaTrackingPayload(tracking))
}