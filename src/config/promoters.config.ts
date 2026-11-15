import publicPromoters from "@/generated/promoters.public.json"
import promotersRoster, {
  type PromoterRosterEntry,
} from "../../content/promoters.roster"

/** Client-safe promoter record (production bundle). */
export type Promoter = Pick<PromoterRosterEntry, "id" | "name">

export type { PromoterRosterEntry }

export function isPromoterRosterEntry(
  promoter: Promoter
): promoter is PromoterRosterEntry {
  return "active" in promoter
}

const productionPromoters: Promoter[] = publicPromoters

export const promoters: PromoterRosterEntry[] | Promoter[] = import.meta.env.DEV
  ? promotersRoster
  : productionPromoters

export default promoters