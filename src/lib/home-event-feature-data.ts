import type { HomeEventFeatureImage } from "@/lib/home-event-feature-image"

export type HomeEventFeatureData = {
  title: string
  ctaHref: string
  ctaExternal: boolean
  ctaLabel: string
  dateLine: string
  timeLine: string
  /** `utm_campaign` slug for analytics. */
  eventCampaign?: string
  /** Meta `content_ids` for ticket checkout (slug + event date). */
  ticketContentId?: string
  /** Meta `destination` when set (Airtable `Ticket Supplier`). */
  ticketSupplier?: string
  imageAlt?: string
  image?: HomeEventFeatureImage
}