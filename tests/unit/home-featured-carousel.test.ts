import { describe, expect, it } from "vitest"

import {
  getHomeFeaturedCarouselMaxIndex,
  HOME_FEATURED_CAROUSEL_VISIBLE_COUNT,
} from "@/lib/home-featured-carousel"

describe("home-featured-carousel", () => {
  it("keeps index at zero when there are at most three events", () => {
    expect(getHomeFeaturedCarouselMaxIndex(0)).toBe(0)
    expect(getHomeFeaturedCarouselMaxIndex(1)).toBe(0)
    expect(getHomeFeaturedCarouselMaxIndex(3)).toBe(0)
  })

  it("allows scrolling one step per extra event beyond the visible window", () => {
    expect(getHomeFeaturedCarouselMaxIndex(4)).toBe(1)
    expect(getHomeFeaturedCarouselMaxIndex(6)).toBe(3)
    expect(
      getHomeFeaturedCarouselMaxIndex(10, HOME_FEATURED_CAROUSEL_VISIBLE_COUNT),
    ).toBe(7)
  })
})