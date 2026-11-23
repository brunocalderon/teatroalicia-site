import { describe, expect, it } from "vitest"

import {
  buildGuestPassPromoterUrl,
  isGuestPassPromoterLinksPath,
  listGuestPassPromoters,
} from "@/lib/guest-pass-promoter-link"

describe("isGuestPassPromoterLinksPath", () => {
  it("matches guest-list promoter link routes only", () => {
    expect(isGuestPassPromoterLinksPath("/i/ecdlv/promoters")).toBe(true)
    expect(isGuestPassPromoterLinksPath("i/murano/promoters")).toBe(true)
    expect(isGuestPassPromoterLinksPath("/i/ecdlv")).toBe(false)
    expect(isGuestPassPromoterLinksPath("/i/ecdlv/gracias")).toBe(false)
  })
})

describe("buildGuestPassPromoterUrl", () => {
  it("builds canonical invitation URL with e param", () => {
    expect(buildGuestPassPromoterUrl("/i/murano", "trini-alvarado")).toBe(
      "https://teatroalicia.com/i/murano?e=trini-alvarado",
    )
  })
})

describe("listGuestPassPromoters", () => {
  it("returns active guest-pass promoters sorted by name", () => {
    const promoters = listGuestPassPromoters()
    expect(promoters.length).toBeGreaterThan(0)
    expect(promoters.every((row) => row.id && row.name)).toBe(true)
    const names = promoters.map((row) => row.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "es"))
    expect(names).toEqual(sorted)
  })
})