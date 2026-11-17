import { describe, expect, it } from "vitest"

import {
  instagramProfileUrl,
  normalizeInstagramUsername,
} from "@/lib/thank-you-instagram"

describe("thank-you Instagram", () => {
  it("normalizes handles and rejects invalid values", () => {
    expect(normalizeInstagramUsername("  @teatroalicia  ")).toBe("teatroalicia")
    expect(normalizeInstagramUsername("")).toBeUndefined()
    expect(normalizeInstagramUsername("bad handle")).toBeUndefined()
    expect(normalizeInstagramUsername("user/name")).toBeUndefined()
  })

  it("builds profile URLs", () => {
    expect(instagramProfileUrl("teatroalicia")).toBe(
      "https://www.instagram.com/teatroalicia/"
    )
  })
})