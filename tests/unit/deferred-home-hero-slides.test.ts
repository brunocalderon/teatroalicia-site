import { describe, expect, it } from "vitest"

import { urlsFromHeroHdBackground } from "@/lib/deferred-home-hero-slides"

describe("urlsFromHeroHdBackground", () => {
  it("parses urls from image-set values", () => {
    const value = `image-set(url("/a.webp") type("image/webp") 1x, url('/b.webp') type("image/webp") 2x)`

    expect(urlsFromHeroHdBackground(value)).toEqual(["/a.webp", "/b.webp"])
  })
})