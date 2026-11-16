import type { JsonLdGraphDocument, JsonLdObject } from "./json-ld-types"

export function composeJsonLdGraph(nodes: JsonLdObject[]): JsonLdGraphDocument {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  }
}