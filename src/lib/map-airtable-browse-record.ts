import type { AirtableRecordData } from "@/lib/airtable-record-schema"
import type { AirtableFieldSet } from "@/lib/map-airtable-cms-page"

export type MapAirtableBrowseRecordResult =
  | { ok: true; data: AirtableRecordData }
  | { ok: false; recordId: string; message: string }

function readSlug(fields: AirtableFieldSet): string | undefined {
  const candidates = ["Slug", "slug"]
  for (const key of candidates) {
    const value = fields[key]
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }
  return undefined
}

export function mapAirtableBrowseRecord(
  airtableRecordId: string,
  createdTime: string | undefined,
  fields: AirtableFieldSet,
): MapAirtableBrowseRecordResult {
  const slug = readSlug(fields)
  if (!slug) {
    return {
      ok: false,
      recordId: airtableRecordId,
      message: "missing or empty Slug",
    }
  }

  return {
    ok: true,
    data: {
      slug,
      airtableRecordId,
      createdTime,
      fieldsJson: JSON.stringify(fields),
    },
  }
}