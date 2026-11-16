import type { FormPerformer } from "@/lib/form-schema"

import type { JsonLdObject } from "./json-ld-types"

export function buildPerformerNodes(
  performers: FormPerformer[] | undefined,
  eventEntityId: string,
): JsonLdObject[] {
  if (!performers?.length) {
    return []
  }

  return performers.map((performer, index) => ({
    "@type": performer.kind,
    "@id": `${eventEntityId}/performer/${index + 1}`,
    name: performer.name,
    ...(performer.sameAs ? { sameAs: performer.sameAs } : {}),
  }))
}

export function performerReferences(nodes: JsonLdObject[]): JsonLdObject[] {
  return nodes.map((node) => ({ "@id": node["@id"] as string }))
}