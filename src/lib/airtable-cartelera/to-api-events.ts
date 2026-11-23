import type { HomeEventFeatureData } from "@/lib/home-event-feature-data"
import {
  appendHomeCarteleraUtm,
  homeCarteleraEventSlug,
} from "@/lib/home-cartelera-utm"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import type { CarteleraApiEvent } from "@/lib/airtable-cartelera/types"
import { formatEventSchedule } from "@/lib/format-event-display"
import type { HomeEventFeatureImage } from "@/lib/home-event-feature-image"
import { defaultAirtableInvitationPath } from "@/lib/airtable-cartelera/to-invitation-form"
import { metaTicketCheckoutContentId } from "@/lib/meta-ticket-checkout"
import { isCarteleraEventVisible } from "@/lib/schema-org/event-datetime"

export function airtableRowToHomeEventFeature(
  row: AirtableCarteleraRow,
  options?: { image?: HomeEventFeatureImage },
): HomeEventFeatureData {
  const schedule = formatEventSchedule(row.eventStart, row.eventEnd, {
    date: "home",
  })
  const campaign = homeCarteleraEventSlug({
    eventId: row.eventId,
    slug: row.slug,
  })
  const ticketUrl = row.ticketUrl?.trim()
  const invitationPath = row.guestListEnabled
    ? row.invitationPath?.trim() ?? defaultAirtableInvitationPath(row.slug)
    : undefined
  const baseCtaHref = ticketUrl ?? invitationPath ?? "#"
  const ctaHref = appendHomeCarteleraUtm(baseCtaHref, campaign)
  const ctaLabel = ticketUrl
    ? "Comprar tickets"
    : "Solicitar acceso"

  return {
    title: row.title,
    ctaHref,
    ctaExternal: Boolean(ticketUrl),
    eventCampaign: campaign,
    ticketContentId: metaTicketCheckoutContentId({
      eventId: row.eventId,
      slug: row.slug,
    }),
    ticketSupplier: row.ticketSupplier,
    ctaLabel,
    dateLine: schedule.dateLine,
    timeLine: schedule.timeLine,
    imageAlt: row.imageAlt,
    image: options?.image,
  }
}

export function filterUpcomingAirtableCarteleraRows(
  rows: AirtableCarteleraRow[],
  now: Date = new Date(),
): AirtableCarteleraRow[] {
  return rows
    .filter((row) =>
      isCarteleraEventVisible(row.eventStart, row.eventEnd, now),
    )
    .sort(
      (a, b) =>
        new Date(a.eventStart).getTime() - new Date(b.eventStart).getTime(),
    )
}

export async function airtableCarteleraRowsToApiEvents(
  rows: AirtableCarteleraRow[],
  options?: {
    now?: Date
    imagesBySlug?: Map<string, HomeEventFeatureImage>
  },
): Promise<CarteleraApiEvent[]> {
  const now = options?.now ?? new Date()
  const imagesBySlug = options?.imagesBySlug
  return filterUpcomingAirtableCarteleraRows(rows, now).map((row) => {
    const feature = airtableRowToHomeEventFeature(row, {
      image: imagesBySlug?.get(row.slug),
    })
    return {
      title: feature.title,
      ctaHref: feature.ctaHref,
      ctaExternal: feature.ctaExternal,
      ctaLabel: feature.ctaLabel,
      dateLine: feature.dateLine,
      timeLine: feature.timeLine,
      eventCampaign: feature.eventCampaign ?? "",
      ticketSupplier: feature.ticketSupplier,
      imageAlt: feature.imageAlt,
      image: feature.image,
    }
  })
}