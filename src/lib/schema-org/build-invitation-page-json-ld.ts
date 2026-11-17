import type { FormEntryData } from "@/lib/form-schema"
import type { VenueConfig } from "@/lib/venue-schema"

import { buildEventFromForm } from "./build-event"
import { buildVenueNode } from "./build-venue"
import { buildWebPageNode } from "./build-webpage"
import { buildWebsiteNode } from "./build-website"
import { canonicalPageUrl } from "./canonical-origin"
import { composeJsonLdGraph } from "./compose-graph"
import { VENUE_ENTITY_ID, WEBSITE_ENTITY_ID, webPageEntityId } from "./ids"
import type { JsonLdGraphDocument } from "./json-ld-types"

export type InvitationPageJsonLdInput = {
  venue: VenueConfig
  data: FormEntryData
  pageTitle: string
  pageDescription?: string
  imageUrl?: string
  venueImageUrl?: string
}

/**
 * Guest-pass / invitation form route: WebPage about the invitation process,
 * full event + venue + organizer + performer nodes in the same graph.
 */
export function buildInvitationPageJsonLd(
  input: InvitationPageJsonLdInput,
): JsonLdGraphDocument | undefined {
  const built = buildEventFromForm({
    data: input.data,
    imageUrl: input.imageUrl,
  })
  if (!built) {
    return undefined
  }

  const pageUrl = canonicalPageUrl(input.data.path)
  const pageId = webPageEntityId(pageUrl)
  const eventId = built.event["@id"] as string

  const nodes = [
    buildWebsiteNode(input.venue),
    buildVenueNode(input.venue, { imageUrl: input.venueImageUrl }),
    built.event,
    ...built.organizers.filter(
      (node) => (node["@id"] as string) !== VENUE_ENTITY_ID,
    ),
    ...built.performers,
    buildWebPageNode({
      "@id": pageId,
      url: pageUrl,
      name: input.pageTitle,
      description: input.pageDescription,
      isPartOfId: WEBSITE_ENTITY_ID,
      mainEntityId: eventId,
      aboutId: eventId,
      primaryImageOfPage: input.imageUrl,
    }),
  ]

  return composeJsonLdGraph(nodes)
}