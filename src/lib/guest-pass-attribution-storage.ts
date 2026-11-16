import type { ReferralAttribution } from "@/lib/referral-attribution"
import {
  displayGuestPassReferralFromSearchParams,
  promoterRefQueryParam,
} from "@/lib/promoters"

const STORAGE_KEY = "teatroalicia-guest-pass-attribution"

export type GuestPassAttributionSession = {
  promoterId: string
  promoterName: string
  verified: boolean
}

export function persistGuestPassAttributionForAnalytics(
  params: URLSearchParams,
  attribution: ReferralAttribution
): void {
  if (typeof window === "undefined") {
    return
  }
  const display = displayGuestPassReferralFromSearchParams(
    params,
    promoterRefQueryParam
  )
  const payload: GuestPassAttributionSession = {
    promoterId: attribution.referralValue,
    promoterName: display?.name ?? "",
    verified: attribution.verified,
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Private mode / quota — analytics only; ignore.
  }
}

export function readGuestPassAttributionFromSession():
  | GuestPassAttributionSession
  | undefined {
  if (typeof window === "undefined") {
    return undefined
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return undefined
    }
    const parsed = JSON.parse(raw) as Partial<GuestPassAttributionSession>
    if (
      typeof parsed.promoterId !== "string" ||
      typeof parsed.promoterName !== "string" ||
      typeof parsed.verified !== "boolean"
    ) {
      return undefined
    }
    return {
      promoterId: parsed.promoterId,
      promoterName: parsed.promoterName,
      verified: parsed.verified,
    }
  } catch {
    return undefined
  }
}