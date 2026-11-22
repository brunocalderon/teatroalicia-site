import { describe, expect, it } from "vitest"

import {
  parseAirtableAttachmentField,
  parseAirtableStringAttachments,
  resolveAirtableBrowseImage,
  resolveAirtableImageUrl,
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

describe("resolveAirtableImageUrl", () => {
  it("strips filename prefix from production cartelera Image cells", () => {
    const value =
      "murano.jpg (https://v5.airtableusercontent.com/v3/u/59/59/1795320000000/ol6ZHgbhcIsbefaNkIGNFw/r1NJpAodZX_9kWYHy2mDBb6ILH06UqBbDYJOU41jN-XE6wRq_ATMhU1g_8Cw0DdHU2Q9nVCzuZGi4GMh5YYmiXCSpHTqejO2ggaMHtvlhEFatBgfPDtoP45iQA2w0n8NDvJnseiIjoMIznrkxCigcM1uQmi1Vi3TcRSik2nclhM/fd3dXEhdS-EDUIqrSHdoQa3TerfpX3LpQ2KUSSzFLSA)"
    const url = resolveAirtableImageUrl(value)
    expect(url).toBe(
      "https://v5.airtableusercontent.com/v3/u/59/59/1795320000000/ol6ZHgbhcIsbefaNkIGNFw/r1NJpAodZX_9kWYHy2mDBb6ILH06UqBbDYJOU41jN-XE6wRq_ATMhU1g_8Cw0DdHU2Q9nVCzuZGi4GMh5YYmiXCSpHTqejO2ggaMHtvlhEFatBgfPDtoP45iQA2w0n8NDvJnseiIjoMIznrkxCigcM1uQmi1Vi3TcRSik2nclhM/fd3dXEhdS-EDUIqrSHdoQa3TerfpX3LpQ2KUSSzFLSA",
    )
    expect(url).not.toContain("murano.jpg")
  })

  it("accepts a plain https URL", () => {
    expect(
      resolveAirtableImageUrl("https://v5.airtableusercontent.com/v3/plain"),
    ).toBe("https://v5.airtableusercontent.com/v3/plain")
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