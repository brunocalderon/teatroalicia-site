import type { JsonLdObject } from "./json-ld-types"

export type WebPageNodeInput = {
  "@id": string
  url: string
  name: string
  description?: string
  inLanguage?: string
  isPartOfId: string
  mainEntityId?: string
  aboutId?: string
  primaryImageOfPage?: string
}

export function buildWebPageNode(input: WebPageNodeInput): JsonLdObject {
  const node: JsonLdObject = {
    "@type": "WebPage",
    "@id": input["@id"],
    url: input.url,
    name: input.name,
    inLanguage: input.inLanguage ?? "es-CL",
    isPartOf: { "@id": input.isPartOfId },
  }

  if (input.description) {
    node.description = input.description
  }
  if (input.mainEntityId) {
    node.mainEntity = { "@id": input.mainEntityId }
  }
  if (input.aboutId) {
    node.about = { "@id": input.aboutId }
  }
  if (input.primaryImageOfPage) {
    node.primaryImageOfPage = input.primaryImageOfPage
  }

  return node
}