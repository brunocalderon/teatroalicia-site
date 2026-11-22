/** `cellFormat=string` attachment: `filename.jpg (https://…)`; multiple parts comma-separated. */
const STRING_ATTACHMENT = /([^(,]+?)\s+\((https?:\/\/[^)]+)\)/g

export type AirtableAttachmentRef = {
  filename: string
  url: string
}

export function parseAirtableStringAttachments(
  value: string,
): AirtableAttachmentRef[] {
  const trimmed = value.trim()
  if (!trimmed) {
    return []
  }

  const attachments: AirtableAttachmentRef[] = []
  for (const match of trimmed.matchAll(STRING_ATTACHMENT)) {
    const filename = match[1]?.trim()
    const url = match[2]?.trim()
    if (filename && url) {
      attachments.push({ filename, url })
    }
  }
  return attachments
}

function parseAirtableJsonAttachments(
  value: unknown[],
): AirtableAttachmentRef[] {
  const attachments: AirtableAttachmentRef[] = []
  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      continue
    }
    const record = item as Record<string, unknown>
    const url = typeof record.url === "string" ? record.url.trim() : ""
    if (!url) {
      continue
    }
    const filename =
      typeof record.filename === "string" && record.filename.trim().length > 0
        ? record.filename.trim()
        : "image"
    attachments.push({ filename, url })
  }
  return attachments
}

/** Resolves attachment URLs from Airtable `Image` (string or JSON attachment array). */
export function parseAirtableAttachmentField(
  value: unknown,
): AirtableAttachmentRef[] {
  if (typeof value === "string") {
    const fromCell = parseAirtableStringAttachments(value)
    if (fromCell.length > 0) {
      return fromCell
    }
    const trimmed = value.trim()
    if (/^https?:\/\//i.test(trimmed)) {
      return [{ filename: "image", url: trimmed }]
    }
    return []
  }
  if (Array.isArray(value)) {
    return parseAirtableJsonAttachments(value)
  }
  return []
}

/** Poster URL from an `Image` cell (`filename.jpg (https://…)` or plain URL). */
export function resolveAirtableImageUrl(value: unknown): string | undefined {
  const attachment = parseAirtableAttachmentField(value)[0]
  return attachment?.url
}

export function resolveAirtableBrowseImage(
  fields: Record<string, unknown>,
): AirtableAttachmentRef | undefined {
  const entry = Object.entries(fields).find(
    ([key]) => key.toLowerCase() === "image",
  )
  if (!entry) {
    return undefined
  }

  return parseAirtableAttachmentField(entry[1])[0]
}