import { trimmedUrlParam } from "@/lib/form-field-visibility"
import { readGuestPassAttributionFromSession } from "@/lib/guest-pass-attribution-storage"
import {
  displayGuestPassReferralFromSearchParams,
  promoterRefQueryParam,
  resolveGuestPassReferralFromSearchParams,
} from "@/lib/promoters"

export type UmamiPromoterEventData = {
  promoter_id: string
  promoter_name: string
  promoter_verified: boolean
}

/** Umami event properties when a guest-pass `?e=` ref is present (URL or session). */
export function getUmamiPromoterEventData(
  params: URLSearchParams
): UmamiPromoterEventData | undefined {
  const fromUrl = trimmedUrlParam(params, promoterRefQueryParam)
  if (fromUrl) {
    const display = displayGuestPassReferralFromSearchParams(params)
    return {
      promoter_id: fromUrl,
      promoter_name: display?.name ?? "",
      promoter_verified: Boolean(
        resolveGuestPassReferralFromSearchParams(params)
      ),
    }
  }

  const stored = readGuestPassAttributionFromSession()
  if (!stored) {
    return undefined
  }

  return {
    promoter_id: stored.promoterId,
    promoter_name: stored.promoterName,
    promoter_verified: stored.verified,
  }
}