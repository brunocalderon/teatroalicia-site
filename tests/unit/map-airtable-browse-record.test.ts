import { describe, expect, it } from "vitest"

import { mapAirtableBrowseRecord } from "@/lib/map-airtable-browse-record"
import { airtableRecordSchema } from "@/lib/airtable-record-schema"

describe("mapAirtableBrowseRecord", () => {
  it("maps Slug and preserves fields", () => {
    const fields = {
      Slug: "murano",
      Title: "Murano: One more night",
      "Event Kind": "social-music",
    }
    const result = mapAirtableBrowseRecord(
      "recZTR2et7aeEZfXu",
      "2026-11-17T03:16:43.000Z",
      fields,
    )

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error("expected ok")
    }

    expect(airtableRecordSchema.parse(result.data)).toEqual(result.data)
    const parsed = JSON.parse(result.data.fieldsJson) as Record<string, string>
    expect(parsed.Title).toBe("Murano: One more night")
  })

  it("fails without Slug", () => {
    const result = mapAirtableBrowseRecord("rec1", undefined, { Title: "x" })
    expect(result.ok).toBe(false)
  })
})