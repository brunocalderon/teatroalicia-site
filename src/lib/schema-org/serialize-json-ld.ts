type JsonLdPrimitive = string | number | boolean | null

type JsonLdValue = JsonLdPrimitive | JsonLdObject | JsonLdValue[]

interface JsonLdObject {
  [key: string]: JsonLdValue | undefined
}

function stripUndefined(value: JsonLdValue): JsonLdValue {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item))
  }
  if (value !== null && typeof value === "object") {
    const next: JsonLdObject = {}
    for (const [key, nested] of Object.entries(value)) {
      if (nested === undefined) {
        continue
      }
      next[key] = stripUndefined(nested as JsonLdValue)
    }
    return next
  }
  return value
}

/** Safe JSON-LD payload for `<script type="application/ld+json">`. */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(stripUndefined(data))
}