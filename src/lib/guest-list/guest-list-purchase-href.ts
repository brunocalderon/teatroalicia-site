import type { FormEntryData } from "@/lib/form-schema"
import {
  appendHomeCarteleraUtm,
  GUEST_LIST_TICKET_UTM_CONTENT,
  homeCarteleraEventSlug,
} from "@/lib/home-cartelera-utm"
import { invitationSlugFromPath } from "@/lib/invitation-bundled-poster"

/** Ticket URL with the same UTM pattern as home cartelera ticket CTAs. */
export function resolveGuestListPurchaseHref(
  data: Pick<FormEntryData, "ticketUrl" | "ticketLink" | "eventId" | "path">,
): string | undefined {
  const raw = (data.ticketUrl ?? data.ticketLink)?.trim()
  if (!raw) {
    return undefined
  }

  const slug =
    invitationSlugFromPath(data.path) ??
    data.path.replace(/^\//, "").replaceAll("/", "-").trim()
  const campaign = homeCarteleraEventSlug({
    eventId: data.eventId,
    slug: slug || "event",
  })

  return appendHomeCarteleraUtm(raw, campaign, GUEST_LIST_TICKET_UTM_CONTENT)
}