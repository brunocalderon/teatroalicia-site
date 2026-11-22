import type { HomeEventFeatureImage } from "@/lib/home-event-feature-image"

export type AirtableCarteleraRow = {
  slug: string
  title: string
  eventId: string
  eventStart: string
  eventEnd?: string
  ticketUrl?: string
  invitationPath?: string
  imageUrl?: string
  /** Original attachment filename from Airtable `Image` (for mirroring). */
  imageFilename?: string
  imageAlt?: string
  eventKind?: string
  language?: string
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
  eventCampaign: string
  imageAlt?: string
  image?: HomeEventFeatureImage
}