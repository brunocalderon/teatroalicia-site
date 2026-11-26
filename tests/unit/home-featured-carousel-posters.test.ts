// @vitest-environment happy-dom

import { describe, expect, it } from "vitest"

import {
  pickLargestSrcsetUrl,
  primeCarouselPosterImage,
} from "@/lib/home-featured-carousel-posters"

describe("home-featured-carousel-posters", () => {
  it("picks the widest candidate from srcset", () => {
    const srcset =
      "/a-640.webp 640w, /a-1280.webp 1280w, /a-400.webp 400w"
    expect(pickLargestSrcsetUrl(srcset)).toBe("/a-1280.webp")
  })

  it("marks carousel posters eager and primed after load", () => {
    const frame = document.createElement("div")
    frame.className = "home-feature__poster-frame"
    const img = document.createElement("img")
    img.className = "home-feature__image"
    img.src = "https://teatroalicia.com/poster.jpg"
    frame.append(img)

    Object.defineProperty(img, "complete", { value: true, configurable: true })
    Object.defineProperty(img, "naturalWidth", { value: 400, configurable: true })

    primeCarouselPosterImage(img)

    expect(img.loading).toBe("eager")
    expect(frame.getAttribute("data-poster-primed")).toBe("")
  })
})