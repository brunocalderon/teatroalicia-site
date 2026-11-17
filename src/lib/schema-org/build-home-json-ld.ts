import type { EventEntryData } from "@/lib/event-schema"
import { eventToSchemaFormData } from "@/lib/event-to-form"
import type { VenueConfig } from "@/lib/venue-schema"
import { getUpcomingEventEntriesForSchema } from "@/lib/home-upcoming-events"

import { buildEventFromForm } from "./build-event"
import { buildUpcomingEventsItemListFromEvents } from "./build-item-list"
import { buildVenueNode } from "./build-venue"
import { buildWebPageNode } from "./build-webpage"
import { buildWebsiteNode } from "./build-website"
import { canonicalPageUrl } from "./canonical-origin"
import { composeJsonLdGraph } from "./compose-graph"
import {
  HOME_WEBPAGE_ENTITY_ID,
  UPCOMING_EVENTS_LIST_ID,
  VENUE_ENTITY_ID,
  WEBSITE_ENTITY_ID,
} from "./ids"
import type { JsonLdGraphDocument } from "./json-ld-types"
import type { JsonLdObject } from "./json-ld-types"

export type HomePageJsonLdInput = {
  venue: VenueConfig
  pageTitle: string
  pageDescription?: string
  /** When provided, embeds upcoming ItemList + full Event nodes for listed events. */
  upcomingEvents?: Array<{ id: string; data: EventEntryData }>
  /** Optional absolute image URLs keyed by event `slug`. */
  eventImageUrlBySlug?: Record<string, string | undefined>
  /** Optimized venue marketing photo (absolute URL). */
  venueImageUrl?: string
  now?: Date
}

/**
 * Homepage graph: WebSite + WebPage + venue entity.
 * When `upcomingEvents` lists future events, adds ItemList + Event nodes.
 */
export function buildHomePageJsonLd(
  input: HomePageJsonLdInput,
): JsonLdGraphDocument {
  const { venue, pageTitle, pageDescription, upcomingEvents = [], now } = input
  const at = now ?? new Date()
  const listed = getUpcomingEventEntriesForSchema(upcomingEvents, at)
  const itemList = buildUpcomingEventsItemListFromEvents(upcomingEvents, at)
  const mainEntityId =
    itemList !== undefined ? UPCOMING_EVENTS_LIST_ID : VENUE_ENTITY_ID

  const eventNodes: JsonLdObject[] = []
  const organizerNodes: JsonLdObject[] = []
  const performerNodes: JsonLdObject[] = []

  for (const entry of listed) {
    const formData = eventToSchemaFormData(entry.data)
    const imageUrl = input.eventImageUrlBySlug?.[entry.data.slug]
    const built = buildEventFromForm({ data: formData, imageUrl })
    if (!built) {
      continue
    }
    eventNodes.push(built.event)
    organizerNodes.push(
      ...built.organizers.filter(
        (node) => (node["@id"] as string) !== VENUE_ENTITY_ID,
      ),
    )
    performerNodes.push(...built.performers)
  }

  const nodes = [
    buildVenueNode(venue, { imageUrl: input.venueImageUrl }),
    buildWebsiteNode(venue),
    buildWebPageNode({
      "@id": HOME_WEBPAGE_ENTITY_ID,
      url: canonicalPageUrl("/"),
      name: pageTitle,
      description: pageDescription ?? venue.description,
      isPartOfId: WEBSITE_ENTITY_ID,
      mainEntityId,
      aboutId: mainEntityId,
    }),
    ...(itemList ? [itemList] : []),
    ...eventNodes,
    ...organizerNodes,
    ...performerNodes,
  ]

  return composeJsonLdGraph(nodes)
}