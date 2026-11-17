import { describe, expect, it } from "vitest"

import {
  appendHomeCarteleraUtm,
  homeCarteleraEventSlug,
} from "@/lib/home-cartelera-utm"

describe("home-cartelera-utm", () => {
  it("derives slug from eventId", () => {
    expect(
      homeCarteleraEventSlug({
        eventId: "teatro-alicia-murano-one-more-night-2026-11-20",
        slug: "murano",
      }),
    ).toBe("murano-one-more-night")
  })

  it("appends UTM params to external ticket URLs", () => {
    const out = appendHomeCarteleraUtm(
      "https://www.passline.com/eventos/murano-one-more-night",
      "murano-one-more-night",
    )
    const url = new URL(out)
    expect(url.searchParams.get("utm_source")).toBe("teatroalicia_site")
    expect(url.searchParams.get("utm_medium")).toBe("referral")
    expect(url.searchParams.get("utm_campaign")).toBe("murano-one-more-night")
    expect(url.searchParams.get("utm_content")).toBe("home_event_list")
  })

  it("appends UTM params to internal form paths", () => {
    const out = appendHomeCarteleraUtm("/i/murano", "murano")
    expect(out).toContain("/i/murano?")
    expect(out).toContain("utm_campaign=murano")
  })
})