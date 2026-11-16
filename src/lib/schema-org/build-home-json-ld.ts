import type { VenueConfig } from "@/lib/venue-schema"

import { buildVenueNode } from "./build-venue"
import { buildWebPageNode } from "./build-webpage"
import { buildWebsiteNode } from "./build-website"
import { canonicalPageUrl } from "./canonical-origin"
import { composeJsonLdGraph } from "./compose-graph"
import { HOME_WEBPAGE_ENTITY_ID, VENUE_ENTITY_ID, WEBSITE_ENTITY_ID } from "./ids"
import type { JsonLdGraphDocument } from "./json-ld-types"

export type HomePageJsonLdInput = {
  venue: VenueConfig
  pageTitle: string
  pageDescription?: string
}

/**
 * Homepage graph: WebSite + WebPage + venue entity.
 * No upcoming-events ItemList until the homepage displays that list.
 */
export function buildHomePageJsonLd(
  input: HomePageJsonLdInput,
): JsonLdGraphDocument {
  const { venue, pageTitle, pageDescription } = input

  const nodes = [
    buildVenueNode(venue),
    buildWebsiteNode(venue),
    buildWebPageNode({
      "@id": HOME_WEBPAGE_ENTITY_ID,
      url: canonicalPageUrl("/"),
      name: pageTitle,
      description: pageDescription ?? venue.description,
      isPartOfId: WEBSITE_ENTITY_ID,
      mainEntityId: VENUE_ENTITY_ID,
    }),
  ]

  return composeJsonLdGraph(nodes)
}