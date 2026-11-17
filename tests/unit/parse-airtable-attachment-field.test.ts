import { describe, expect, it } from "vitest"

import {
  parseAirtableAttachmentField,
  parseAirtableStringAttachments,
  resolveAirtableBrowseImage,
} from "@/lib/parse-airtable-attachment-field"

describe("parseAirtableStringAttachments", () => {
  it("parses filename and url from string cell format", () => {
    const value =
      "murano.jpg (https://v5.airtableusercontent.com/v3/u/59/59/example/vUUn_n8SS3M373JqhZ0RFrOrGbRV95Erf35sOed_nQY)"
  const result = parseAirtableStringAttachments(value)
    expect(result).toEqual([
      {
        filename: "murano.jpg",
        url: "https://v5.airtableusercontent.com/v3/u/59/59/example/vUUn_n8SS3M373JqhZ0RFrOrGbRV95Erf35sOed_nQY",
      },
    ])
  })
})

describe("parseAirtableAttachmentField", () => {
  it("parses JSON attachment arrays", () => {
    const result = parseAirtableAttachmentField([
      {
        id: "att1",
        url: "https://v5.airtableusercontent.com/v3/example",
        filename: "poster.png",
      },
    ])
    expect(result).toEqual([
      {
        filename: "poster.png",
        url: "https://v5.airtableusercontent.com/v3/example",
      },
    ])
  })
})

describe("resolveAirtableBrowseImage", () => {
  it("finds Image case-insensitively", () => {
    const fields = {
      Slug: "murano",
      Image:
        "murano.jpg (https://v5.airtableusercontent.com/v3/u/59/59/example/file)",
    }
    expect(resolveAirtableBrowseImage(fields)).toEqual({
      filename: "murano.jpg",
      url: "https://v5.airtableusercontent.com/v3/u/59/59/example/file",
    })
  })
})