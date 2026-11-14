import promoters, {
  type Promoter,
  isPromoterRosterEntry,
} from "@/config/promoters.config"

export type { Promoter }
export { promoters, isPromoterRosterEntry }

const REF_QUERY_PARAM = "e"

function isGuestPassEligible(promoter: Promoter): boolean {
  if (!isPromoterRosterEntry(promoter)) {
    return true
  }
  return promoter.active && promoter.guest_pass_enabled
}

export function findPromoterById(ref: string): Promoter | undefined {
  const normalized = ref.trim().toLowerCase()
  if (!normalized) {
    return undefined
  }
  return promoters.find((promoter) => promoter.id.toLowerCase() === normalized)
}

/** Active promoter allowed to attribute guest-pass / invitation signups. */
export function resolveGuestPassReferral(ref: string): Promoter | undefined {
  const promoter = findPromoterById(ref)
  if (!promoter || !isGuestPassEligible(promoter)) {
    return undefined
  }
  return promoter
}

export function resolveGuestPassReferralFromSearchParams(
  params: URLSearchParams,
  paramName = REF_QUERY_PARAM
): Promoter | undefined {
  const ref = params.get(paramName)?.trim() ?? ""
  return resolveGuestPassReferral(ref)
}

export const promoterRefQueryParam = REF_QUERY_PARAM