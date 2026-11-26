import { describe, expect, it } from "vitest"

import {
  getHomeFeaturedCarouselActiveIndices,
  getHomeFeaturedCarouselMaxIndex,
  HOME_FEATURED_CAROUSEL_VISIBLE_COUNT,
  measureFeaturedCarouselIndicatorStep,
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

  it("accents three hyphen indicators for the visible carousel window", () => {
    expect(
      getHomeFeaturedCarouselActiveIndices(0, 6, HOME_FEATURED_CAROUSEL_VISIBLE_COUNT),
    ).toEqual([0, 1, 2])
    expect(
      getHomeFeaturedCarouselActiveIndices(1, 6, HOME_FEATURED_CAROUSEL_VISIBLE_COUNT),
    ).toEqual([1, 2, 3])
    expect(
      getHomeFeaturedCarouselActiveIndices(3, 6, HOME_FEATURED_CAROUSEL_VISIBLE_COUNT),
    ).toEqual([3, 4, 5])
  })

  it("accents fewer than three indicators when there are fewer events", () => {
    expect(getHomeFeaturedCarouselActiveIndices(0, 2)).toEqual([0, 1])
  })

  it("measures indicator step from layout offsets", () => {
    const first = {
      getBoundingClientRect: () => ({ left: 100, width: 44 }),
    } as HTMLElement
    const second = {
      getBoundingClientRect: () => ({ left: 154, width: 44 }),
    } as HTMLElement
    expect(measureFeaturedCarouselIndicatorStep([first, second])).toBe(54)
  })
})