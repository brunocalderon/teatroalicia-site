import { describe, expect, it } from "vitest"

import {
  airtableAssetPublicPath,
  sanitizeAirtableAssetFilename,
} from "@/lib/airtable-asset-path"
import { patchFieldsJsonWithLocalImage } from "@/lib/sync-airtable-browse-images"

describe("sanitizeAirtableAssetFilename", () => {
  it("keeps safe basename characters", () => {
    expect(sanitizeAirtableAssetFilename("murano.jpg")).toBe("murano.jpg")
    expect(sanitizeAirtableAssetFilename("../evil/murano.jpg")).toBe("murano.jpg")
  })
})

describe("airtableAssetPublicPath", () => {
  it("builds a public path under airtable-assets", () => {
    expect(airtableAssetPublicPath("murano", "poster.jpg")).toBe(
      "/airtable-assets/murano/poster.jpg",
    )
  })
})

describe("patchFieldsJsonWithLocalImage", () => {
  it("replaces Image CDN url with local path in string cell format", () => {
    const fieldsJson = JSON.stringify({
      Slug: "murano",
      Image: "murano.jpg (https://v5.airtableusercontent.com/v3/example)",
    })
    const patched = patchFieldsJsonWithLocalImage(
      fieldsJson,
      "/airtable-assets/murano/murano.jpg",
    )
    const fields = JSON.parse(patched) as Record<string, string>
    expect(fields.Image).toBe("murano.jpg (/airtable-assets/murano/murano.jpg)")
  })
})