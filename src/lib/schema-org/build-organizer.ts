import type { FormEntryData, FormOrganizer } from "@/lib/form-schema"

import { VENUE_ENTITY_ID } from "./ids"
import type { JsonLdObject } from "./json-ld-types"

export function buildOrganizerNodes(
  data: Pick<FormEntryData, "organizer" | "organizerIsVenue">,
  eventEntityId: string,
): JsonLdObject[] {
  if (data.organizerIsVenue) {
    return [
      {
        "@type": "Organization",
        "@id": VENUE_ENTITY_ID,
      },
    ]
  }

  const organizer = data.organizer
  if (!organizer) {
    return []
  }

  return [buildOrganizerEntity(organizer, `${eventEntityId}/organizer`)]
}

function buildOrganizerEntity(
  organizer: FormOrganizer,
  entityId: string,
): JsonLdObject {
  return {
    "@type": organizer.kind,
    "@id": entityId,
    name: organizer.name,
    ...(organizer.url ? { url: organizer.url } : {}),
    ...(organizer.sameAs ? { sameAs: organizer.sameAs } : {}),
  }
}

export function organizerReferences(nodes: JsonLdObject[]): JsonLdObject[] {
  return nodes.map((node) => ({ "@id": node["@id"] as string }))
}