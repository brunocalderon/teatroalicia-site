import type { HomeEventFeatureImage } from "@/lib/home-event-feature-image"

export type AirtableCarteleraRow = {
  slug: string
  title: string
  eventId: string
  eventStart: string
  eventEnd?: string
  ticketUrl?: string
  /** Airtable `Ticket Supplier` — Meta `destination` and Formgong hidden `provider`. */
  ticketSupplier?: string
  /** Airtable `Supplier Event ID` — Formgong hidden `event_id`. */
  supplierEventId?: string
  /** Airtable `Guest Pass Ticket ID` — Formgong hidden `ticket_id`. */
  guestPassTicketId?: string
  /** Airtable `Guest List` — exposes `/i/{slug}` when true. */
  guestListEnabled: boolean
  /** Raw `Guest List Fields` JSON from Airtable. */
  guestListFieldsRaw?: string
  invitationPath?: string
  imageUrl?: string
  /** Original attachment filename from Airtable `Image` (for mirroring). */
  imageFilename?: string
  imageAlt?: string
  eventKind?: string
  airtableRecordId: string
  createdTime?: string
}

export type CarteleraApiEvent = {
  title: string
  ctaHref: string
  ctaExternal: boolean
  ctaLabel: string
  dateLine: string
  timeLine: string
  eventId: string
  eventCampaign: string
  ticketContentId: string
  ticketSupplier?: string
  imageAlt?: string
  image?: HomeEventFeatureImage
}