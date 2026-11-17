import { describe, expect, it } from "vitest"

import { cmsPageSchema } from "@/lib/cms-page-schema"
import { mapAirtableCmsPageFields } from "@/lib/map-airtable-cms-page"

describe("mapAirtableCmsPageFields", () => {
  it("maps a valid row", () => {
    const result = mapAirtableCmsPageFields("rec123", {
      slug: "nosotros",
      path: "/info/nosotros",
      title: "Nosotros",
      body: "Texto **destacado**.",
      description: "Conoce Teatro Alicia.",
      lang: "es",
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error("expected ok")
    }
    expect(cmsPageSchema.parse(result.data)).toEqual(result.data)
  })

  it("fails when slug is missing", () => {
    const result = mapAirtableCmsPageFields("rec456", {
      path: "/info/sin-slug",
      title: "Sin slug",
    })
    expect(result.ok).toBe(false)
    if (result.ok) {
      throw new Error("expected failure")
    }
    expect(result.message).toContain("slug")
  })

  it("rejects paths outside /info/ at schema parse", () => {
    const result = mapAirtableCmsPageFields("rec789", {
      slug: "contacto",
      path: "/contacto",
      title: "Conflicto",
    })
    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error("expected ok map")
    }
    expect(() => cmsPageSchema.parse(result.data)).toThrow()
  })
})