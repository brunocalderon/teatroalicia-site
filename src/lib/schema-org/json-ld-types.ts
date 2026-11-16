export type JsonLdObject = Record<string, unknown>

export type JsonLdGraphDocument = {
  "@context": "https://schema.org"
  "@graph": JsonLdObject[]
}