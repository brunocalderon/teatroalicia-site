import { resolveFormIntroBodyHtml } from "@/lib/render-form-body-markdown"
import { buildFormSplitVisualImage } from "@/lib/form-split-visual-image"
import { formMetaDescription } from "@/lib/form-schema"
import type { AirtableCarteleraRow } from "@/lib/airtable-cartelera/types"
import { carteleraPosterImageBySlug } from "@/lib/airtable-cartelera/cartelera-poster-image-modules"
import { CANONICAL_SITE_ORIGIN } from "@/lib/schema-org/canonical-origin"
import { buildInvitationPageJsonLd } from "@/lib/schema-org/build-invitation-page-json-ld"
import { resolveVenuePrimaryImageAbsoluteUrl } from "@/lib/venue-primary-image"
import { venueConfig } from "../../../content/venue"
import { sitePageBackdropCss } from "@/lib/site-page-backdrop-css"
import {
  eventDetailTracking,
  type MarketingPageTracking,
} from "@/lib/marketing-page-tracking"

import { rowToEventDetailFormData } from "./row-to-event-detail-form-data"

export type EventDetailPosterImage = Awaited<
  ReturnType<typeof buildFormSplitVisualImage>
>

export type EventDetailPageContext = {
  row: AirtableCarteleraRow
  title: string
  lang: string
  pageDescription: string
  descriptionHtml: string | undefined
  posterImage: EventDetailPosterImage | undefined
  imageAlt: string
  tracking: MarketingPageTracking
  jsonLd: ReturnType<typeof buildInvitationPageJsonLd>
  backdropCss: string
  lcpImage:
    | {
        src: string
        srcSet: string
        sizes: string
      }
    | undefined
}

async function resolveEventDetailPoster(
  slug: string,
): Promise<EventDetailPosterImage | undefined> {
  const source = await carteleraPosterImageBySlug(slug)
  if (!source) {
    return undefined
  }
  return buildFormSplitVisualImage(source)
}

export async function prepareEventDetailPage(
  row: AirtableCarteleraRow,
): Promise<EventDetailPageContext> {
  const schemaData = rowToEventDetailFormData(row)

  const descriptionRaw = row.eventDescription?.trim()
  const descriptionHtml = descriptionRaw
    ? await resolveFormIntroBodyHtml(descriptionRaw, "html")
    : undefined

  const posterImage = await resolveEventDetailPoster(row.slug)
  const tracking = eventDetailTracking(row.title, row.eventId)
  const pageDescription = formMetaDescription(schemaData)

  const eventImageUrl = posterImage
    ? new URL(posterImage.src, CANONICAL_SITE_ORIGIN).href
    : undefined
  const venueImageUrl = await resolveVenuePrimaryImageAbsoluteUrl()
  const jsonLd = buildInvitationPageJsonLd({
    venue: venueConfig,
    data: schemaData,
    pageTitle: row.title,
    pageDescription,
    imageUrl: eventImageUrl,
    venueImageUrl,
  })

  const backdropCss = sitePageBackdropCss("event-detail-page")

  const lcpImage = posterImage
    ? {
        src: posterImage.src,
        srcSet: posterImage.srcSet,
        sizes: posterImage.sizes,
      }
    : undefined

  return {
    row,
    title: row.title,
    lang: schemaData.lang,
    pageDescription,
    descriptionHtml,
    posterImage,
    imageAlt: row.imageAlt ?? row.title,
    tracking,
    jsonLd,
    backdropCss,
    lcpImage,
  }
}