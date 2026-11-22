import { describe, expect, it } from "vitest"

import { sitePageBackdropCss } from "@/lib/site-page-backdrop-css"

describe("sitePageBackdropCss", () => {
  it("hides the global LQIP backdrop when the cartelera hero is primary", () => {
    const css = sitePageBackdropCss("home-page", {
      primaryHeroBackground: true,
    })

    expect(css).toContain("home-hero__carousel")
    expect(css).toContain("opacity:0!important")
    expect(css).toContain("visibility:hidden")
  })
})