import { describe, expect, it } from "vitest"

import { homeContent } from "../../content/home"

describe("homeContent", () => {
  it("loads validated marketing copy", () => {
    expect(homeContent.meta.title).toMatch(/^Teatro Alicia/)
    expect(homeContent.cartelera.heading).toBe("Cartelera")
    expect(homeContent.hero.lead.length).toBeGreaterThan(20)
  })
})