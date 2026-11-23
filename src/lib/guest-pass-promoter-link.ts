import publicPromoters from "@/generated/promoters.public.json"
import type { Promoter } from "@/lib/promoters"
import { promoterRefQueryParam } from "@/lib/promoters"
import { canonicalPageUrl } from "@/lib/schema-org/canonical-origin"

const GUEST_PASS_PROMOTER_LINKS_PATH = /^\/i\/[^/]+\/promoters\/?$/

/** `/i/:slug/promoters` — promoter link list (not a Formgong invitation path). */
export function isGuestPassPromoterLinksPath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return GUEST_PASS_PROMOTER_LINKS_PATH.test(normalized)
}

/** Guest-pass promoters allowed for `?e=` attribution (build snapshot). */
export function listGuestPassPromoters(): Promoter[] {
  return [...publicPromoters].sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  )
}

/** Absolute invitation URL with promoter referral query (`?e=`). */
export function buildGuestPassPromoterUrl(
  invitationPath: string,
  promoterId: string,
): string {
  const base = canonicalPageUrl(invitationPath)
  const url = new URL(base)
  url.searchParams.set(promoterRefQueryParam, promoterId.trim())
  return url.href
}

export type GuestPassPromoterLinkRow = Promoter & {
  url: string
}

export function guestPassPromoterLinkRows(
  invitationPath: string,
): GuestPassPromoterLinkRow[] {
  return listGuestPassPromoters().map((promoter) => ({
    ...promoter,
    url: buildGuestPassPromoterUrl(invitationPath, promoter.id),
  }))
}