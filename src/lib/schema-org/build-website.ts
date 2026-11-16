import type { VenueConfig } from "@/lib/venue-schema"

import { canonicalPageUrl } from "./canonical-origin"
import { VENUE_ENTITY_ID, WEBSITE_ENTITY_ID } from "./ids"
import type { JsonLdObject } from "./json-ld-types"

export function buildWebsiteNode(config: VenueConfig): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ENTITY_ID,
    url: canonicalPageUrl("/"),
    name: config.name,
    description: config.description,
    inLanguage: "es-CL",
    publisher: {
      "@id": VENUE_ENTITY_ID,
    },
  }
}