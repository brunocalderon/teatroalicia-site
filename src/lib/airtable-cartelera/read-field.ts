export type AirtableFieldSet = Record<string, unknown>

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]+/g, "")
}

export function readAirtableField(
  fields: AirtableFieldSet,
  aliases: string[],
): string | undefined {
  const aliasKeys = new Set(aliases.map((name) => normalizeKey(name)))

  for (const [key, value] of Object.entries(fields)) {
    if (!aliasKeys.has(normalizeKey(key))) {
      continue
    }
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value)
    }
  }

  return undefined
}

function readNativeAirtableBoolean(
  fields: AirtableFieldSet,
  aliases: string[],
): boolean | undefined {
  const aliasKeys = new Set(aliases.map((name) => normalizeKey(name)))
  for (const [key, value] of Object.entries(fields)) {
    if (!aliasKeys.has(normalizeKey(key))) {
      continue
    }
    if (typeof value === "boolean") {
      return value
    }
  }
  return undefined
}

export function readAirtableBoolean(
  fields: AirtableFieldSet,
  aliases: string[],
): boolean | undefined {
  const native = readNativeAirtableBoolean(fields, aliases)
  if (native !== undefined) {
    return native
  }

  const raw = readAirtableField(fields, aliases)
  if (raw === undefined) {
    return undefined
  }
  const value = raw.toLowerCase()
  if (["true", "1", "yes", "si", "sí", "checked"].includes(value)) {
    return true
  }
  if (["false", "0", "no"].includes(value)) {
    return false
  }
  return undefined
}